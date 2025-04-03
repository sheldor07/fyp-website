import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";
import fs from 'fs';
import path from 'path';

// Load projects data from JSON file
let localProjects = [];
try {
  const projectsFilePath = path.join(process.cwd(), 'public', 'projects.json');
  const projectsData = fs.readFileSync(projectsFilePath, 'utf8');
  localProjects = JSON.parse(projectsData);
  console.log(`Loaded ${localProjects.length} projects from projects.json`);
} catch (error) {
  console.error('Error loading projects.json:', error);
}

// Load environment variables - in Next.js these would typically come from .env.local
console.log("Loading environment variables...");
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const INDEX_NAME = process.env.INDEX_NAME || "fyp-projects";
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-ada-002";

console.log("Environment variables status:");
console.log(`OPENAI_API_KEY: ${OPENAI_API_KEY}`);
console.log(`PINECONE_API_KEY: ${PINECONE_API_KEY}`);
console.log(`INDEX_NAME: ${INDEX_NAME}`);
console.log(`EMBEDDING_MODEL: ${EMBEDDING_MODEL}`);

let openai;
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
}

/**
 * Initialize Pinecone and connect to index
 */
async function initializePinecone() {
  if (!PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY not found in environment variables");
  }
  
  // Initialize Pinecone
  const pc = new Pinecone({
    apiKey: PINECONE_API_KEY,
  });
  
  // Get index
  return pc.Index(INDEX_NAME);
}

/**
 * Generate embedding for a query string
 */
async function createQueryEmbedding(queryText) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY not found in environment variables");
  }
  
  const response = await openai.embeddings.create({
    input: queryText,
    model: EMBEDDING_MODEL
  });
  
  return response.data[0].embedding;
}

/**
 * Search for projects semantically similar to the query text
 */
async function semanticSearch(queryText, filters = {}, topK = 20) {
  try {
    // First apply filters to local projects data
    let filteredProjects = [...localProjects];
    
    // Apply filters to local projects
    if (filters.category) {
      filteredProjects = filteredProjects.filter(project => 
        project.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.type) {
      filteredProjects = filteredProjects.filter(project => 
        project.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }
    
    if (filters.supervisor && filters.supervisor.$eq) {
      filteredProjects = filteredProjects.filter(project => 
        project.supervisor.toLowerCase().includes(filters.supervisor.$eq.toLowerCase())
      );
    }
    
    if (filters.isJointOrURECA && filters.isJointOrURECA.$ne === "No") {
      filteredProjects = filteredProjects.filter(project => 
        project.isJointOrURECA !== "No"
      );
    }
    
    // Check if we have Pinecone and OpenAI API keys
    const hasAPIKeys = PINECONE_API_KEY && OPENAI_API_KEY;
    
    if (!hasAPIKeys) {
      console.log("API keys not configured. Using local data with basic scoring.");
      
      // Simple relevance scoring based on query terms
      if (queryText.trim() !== '') {
        const queryTerms = queryText.toLowerCase().split(/\s+/);
        
        filteredProjects = filteredProjects.map(project => {
          let relevance = project.score || 0.5;
          
          queryTerms.forEach(term => {
            if (term.length < 3) return; // Skip short terms
            
            // Check title
            if (project.title.toLowerCase().includes(term)) {
              relevance += 0.1;
            }
            
            // Check summary
            if (project.summary && project.summary.toLowerCase().includes(term)) {
              relevance += 0.05;
            }
            
            // Check keywords
            if (project.keywords && project.keywords.some(k => k.toLowerCase().includes(term))) {
              relevance += 0.08;
            }
          });
          
          return {
            ...project,
            score: Math.min(relevance, 1) // Cap at 1.0
          };
        });
      }
      
      // Sort by score (descending)
      filteredProjects.sort((a, b) => b.score - a.score);
      
      // Return top K results
      return filteredProjects.slice(0, topK);
    } else {
      // Use real semantic search with Pinecone and OpenAI for scoring
      console.log("Using Pinecone for semantic search scoring");
      
      // Initialize Pinecone and get index
      const index = await initializePinecone();
      
      // Generate query embedding
      const queryEmbedding = await createQueryEmbedding(queryText);
      
      // Get project IDs from filtered projects
      const filteredProjectIds = filteredProjects.map(p => p.projectNo);
      
      // Query Pinecone with filtered project IDs
      const results = await index.query({
        vector: queryEmbedding,
        topK: 100, // Request more to ensure we get enough matches for our filtered set
        includeMetadata: true
      });
      
      // Create a map of project scores from Pinecone results
      const projectScores = new Map();
      console.log(`Pinecone returned ${results.matches.length} matches`);
      
      // Log a sample of scores to debug
      if (results.matches.length > 0) {
        console.log("Sample of Pinecone scores:");
        for (let i = 0; i < Math.min(5, results.matches.length); i++) {
          console.log(`${results.matches[i].id}: ${results.matches[i].score}`);
        }
      }
      
      results.matches.forEach(match => {
        projectScores.set(match.id, match.score);
      });
      
      // Add scores to filtered projects
      const scoredProjects = filteredProjects.map(project => {
        const semanticScore = projectScores.get(project.projectNo);
        
        // Apply score normalization to spread out the values
        // Pinecone scores are usually clustered in the 0.7-0.9 range
        // This will spread them out more for better visual differentiation
        let normalizedScore;
        if (semanticScore) {
          // Apply a power transformation to spread out scores
          normalizedScore = Math.pow(semanticScore, 2);
        } else {
          normalizedScore = 0.25; // Lower default for non-matched items
        }
        
        return {
          ...project,
          score: normalizedScore
        };
      });
      
      // Sort by score (descending)
      scoredProjects.sort((a, b) => b.score - a.score);
      
      // Return top K results
      return scoredProjects.slice(0, topK);
    }
  } catch (error) {
    console.error("Error in semantic search:", error);
    
    // Fallback to basic filtering and scoring
    console.log("Error using Pinecone. Falling back to local filtering only.");
    
    let filteredProjects = [...localProjects];
    
    // Apply filters
    if (filters.category) {
      filteredProjects = filteredProjects.filter(project => 
        project.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    
    if (filters.type) {
      filteredProjects = filteredProjects.filter(project => 
        project.type.toLowerCase().includes(filters.type.toLowerCase())
      );
    }
    
    if (filters.supervisor && filters.supervisor.$eq) {
      filteredProjects = filteredProjects.filter(project => 
        project.supervisor.toLowerCase().includes(filters.supervisor.$eq.toLowerCase())
      );
    }
    
    if (filters.isJointOrURECA && filters.isJointOrURECA.$ne === "No") {
      filteredProjects = filteredProjects.filter(project => 
        project.isJointOrURECA !== "No"
      );
    }
    
    // Basic keyword matching for scoring
    if (queryText.trim() !== '') {
      const queryTerms = queryText.toLowerCase().split(/\s+/);
      
      filteredProjects = filteredProjects.map(project => {
        let relevance = 0.5;
        
        queryTerms.forEach(term => {
          if (term.length < 3) return;
          
          if (project.title.toLowerCase().includes(term)) {
            relevance += 0.1;
          }
          
          if (project.summary && project.summary.toLowerCase().includes(term)) {
            relevance += 0.05;
          }
          
          if (project.keywords && project.keywords.some(k => k.toLowerCase().includes(term))) {
            relevance += 0.08;
          }
        });
        
        return {
          ...project,
          score: Math.min(relevance, 1)
        };
      });
    }
    
    // Sort by score
    filteredProjects.sort((a, b) => b.score - a.score);
    
    return filteredProjects.slice(0, topK);
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get query parameters
  const query = searchParams.get('query') || '';
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const supervisor = searchParams.get('supervisor');
  const isJointOrURECA = searchParams.get('joint') === 'true';
  const topK = parseInt(searchParams.get('top') || '20', 10);
  const initialLoad = searchParams.get('initial') === 'true';
  
  // Build filters
  const filters = {};
  if (category) {
    filters.category = category;
  }
  if (type) {
    filters.type = type;
  }
  if (supervisor) {
    filters.supervisor = { $eq: supervisor };
  }
  if (isJointOrURECA) {
    filters.isJointOrURECA = { $ne: "No" };
  }
  
  try {
    // For initial load or empty query, just return all projects with filter
    if (initialLoad || query.trim() === '') {
      // Apply filters to local projects
      let filteredProjects = [...localProjects];
      
      if (filters.category) {
        filteredProjects = filteredProjects.filter(project => 
          project.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      if (filters.type) {
        filteredProjects = filteredProjects.filter(project => 
          project.type.toLowerCase().includes(filters.type.toLowerCase())
        );
      }
      
      if (filters.supervisor && filters.supervisor.$eq) {
        filteredProjects = filteredProjects.filter(project => 
          project.supervisor.toLowerCase().includes(filters.supervisor.$eq.toLowerCase())
        );
      }
      
      if (filters.isJointOrURECA && filters.isJointOrURECA.$ne === "No") {
        filteredProjects = filteredProjects.filter(project => 
          project.isJointOrURECA !== "No"
        );
      }
      
      // Sort by project number if no query
      filteredProjects.sort((a, b) => {
        return a.projectNo.localeCompare(b.projectNo);
      });
      
      // Set default score for display
      filteredProjects = filteredProjects.map(project => ({
        ...project,
        score: 0.5
      }));
      
      // Return all filtered projects with total count, but paginate if needed
      return Response.json({ 
        results: filteredProjects,
        total: filteredProjects.length,
        usingSemantic: false 
      });
    }
    
    // Perform search for non-empty queries
    const results = await semanticSearch(query, filters, topK);
    
    // Check if we have API keys to determine if semantic search was used
    const usingSemantic = !!(PINECONE_API_KEY && OPENAI_API_KEY);
    
    return Response.json({ 
      results,
      total: results.length,
      usingSemantic 
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return Response.json({ 
      error: error.message,
      usingSemantic: false 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Get parameters from request body
    const { query = '', filters = {}, topK = 20, initialLoad = false } = body;
    
    // For initial load or empty query, just return filtered projects
    if (initialLoad || query.trim() === '') {
      // Apply filters to local projects
      let filteredProjects = [...localProjects];
      
      if (filters.category) {
        filteredProjects = filteredProjects.filter(project => 
          project.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      if (filters.type) {
        filteredProjects = filteredProjects.filter(project => 
          project.type.toLowerCase().includes(filters.type.toLowerCase())
        );
      }
      
      if (filters.supervisor && filters.supervisor.$eq) {
        filteredProjects = filteredProjects.filter(project => 
          project.supervisor.toLowerCase().includes(filters.supervisor.$eq.toLowerCase())
        );
      }
      
      if (filters.isJointOrURECA && filters.isJointOrURECA.$ne === "No") {
        filteredProjects = filteredProjects.filter(project => 
          project.isJointOrURECA !== "No"
        );
      }
      
      // Sort by project number if no query
      filteredProjects.sort((a, b) => {
        return a.projectNo.localeCompare(b.projectNo);
      });
      
      // Set default score for display
      filteredProjects = filteredProjects.map(project => ({
        ...project,
        score: 0.5
      }));
      
      // Return all filtered projects with total count, but paginate if needed
      return Response.json({ 
        results: filteredProjects,
        total: filteredProjects.length,
        usingSemantic: false 
      });
    }
    
    // Perform search for non-empty queries
    const results = await semanticSearch(query, filters, topK);
    
    // Check if we have API keys to determine if semantic search was used
    const usingSemantic = !!(PINECONE_API_KEY && OPENAI_API_KEY);
    
    return Response.json({ 
      results,
      total: results.length,
      usingSemantic 
    });
  } catch (error) {
    console.error('Error performing search:', error);
    return Response.json({ 
      error: error.message,
      usingSemantic: false 
    }, { status: 500 });
  }
}