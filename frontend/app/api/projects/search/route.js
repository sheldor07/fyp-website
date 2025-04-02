import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

// Mock data for fallback
const mockProjects = [
  {
    projectNo: "CCDS25-0001",
    title: "VIS4AI: Visual analytics for explainable Large Vision Language Models",
    summary: "Existing large vision language models often work like a blackbox. There are a really large number of parameters in the large vision language models. This project aims to develop an interactive visual analytics approach to explain which set of parameters are responsible for specific functions or concepts and how the large vision language models work.",
    supervisor: "Ast/P Wang Yong",
    isJointOrURECA: "No",
    category: "Software Only",
    type: "Research & Development",
    keywords: [
      "Artificial Intelligence",
      "Human Computer Interaction",
      "Web-based Applications"
    ],
    score: 0.9875
  },
  {
    projectNo: "CCDS25-0002",
    title: "VIS4AI: Visual analytics for explainable Large Language Models",
    summary: "For Large Language Models(LLMs), besides ChatGPT whose source-code is not publicly released, there are also some open-sourced LLMs like miniGPT-4, llava, mPlug-OWL, Otter and InstructLib. There are a really large number of parameters in the LLMs, and their detailed parameters are actually accessible. So one question to ask ourselves is: can we explain which set of parameters are responsible for specific functions or concepts?",
    supervisor: "Ast/P Wang Yong",
    isJointOrURECA: "No",
    category: "Software Only",
    type: "Research & Development",
    keywords: [
      "Artificial Intelligence",
      "Web-based Applications",
      "Human Computer Interaction"
    ],
    score: 0.9752
  },
  {
    projectNo: "CCDS25-0012",
    title: "Application of Generative AI in Travel Planning",
    summary: "Generative AI (GAI) is expected to improve transportation services by suggesting users the best modes of transportation to travel among places. This project will develop a system of mobile personalized transportation service that a user can specific travel requirements such as origins, multiple destinations, time, and other requirements (e.g., bus or train preferences), and the system will generate the best travel plans for the users. Generative AI technologies such as large language models (LLMs) and Stable Diffusion can be used to support the system.",
    supervisor: "Prof Dusit Niyato",
    isJointOrURECA: "No",
    category: "Software Only",
    type: "Design & Implementation",
    keywords: [
      "Artificial Intelligence",
      "Mobile Applications"
    ],
    score: 0.8965
  },
  {
    projectNo: "CCDS25-0003",
    title: "Audio-based highlighting for visualization presentation",
    summary: "We have implemented a hard-coded system to achieve audio-based highlighting for visualization presentation, which is not actually generalizable. Can we make use of the latest progress of AI and achieve a generic solution that can achieve real-time audio-based highlighting of visualization presentations?",
    supervisor: "Ast/P Wang Yong",
    isJointOrURECA: "No",
    category: "Software Only",
    type: "Research & Development",
    keywords: [
      "Human Computer Interaction",
      "Image Analysis & Processing",
      "Web-based Applications"
    ],
    score: 0.8752
  },
  {
    projectNo: "CCDS25-0004",
    title: "Emotion-driven stylish visualization generation",
    summary: "Given a plain standard chart, how can we automatically generate some fancy decorations to convey the underlying emotions we want to convey? There have been a series of research on the emotion in animated transitions, but it seems that there are still not too many research on the emotion of static visualizations.",
    supervisor: "Ast/P Wang Yong",
    isJointOrURECA: "No",
    category: "Software Only",
    type: "Research & Development",
    keywords: [
      "Artificial Intelligence",
      "Human Computer Interaction",
      "Image Analysis & Processing"
    ],
    score: 0.8547
  },
  {
    projectNo: "CCDS25-0025",
    title: "Music from the air - digital terpsiton",
    summary: "This project requires that the student MUST BE FAMILIAR with the theory of music (scales, cords, harmony, etc) and can play some musical instrument. One hundred years ago the theremin was invented. This is an electronic musical instrument controlled without physical contact by hands of the performer. The theremin consists of two metal antennas that sense the relative position of the thereminist's hands and control pitch of the notes with one hand, and volume with the other.",
    supervisor: "A/P Alexei Sourin",
    isJointOrURECA: "Yes",
    category: "Hardware & Software (Mostly Software)",
    type: "Research & Development",
    keywords: [
      "Human Computer Interaction",
      "Video/Audio/Speech Processing"
    ],
    score: 0.7432
  },
  {
    projectNo: "CCDS25-0028",
    title: "Predicting eye movements with AI models",
    summary: "Humans do not perceive the entire scenes at once. Instead, they move their eyes and pay attention to certain parts of the visual scenes. How do we come up with AI models capable of predicting human eye movements? Students get to program computational models of eye movement predictions. Alternatively, students also get to learn how to use advanced eye tracking devices in the lab, design eye tracking expeirments with programming languages, collecting human data, and analyzing these eye movement data.",
    supervisor: "Ast/P Zhang Mengmi",
    isJointOrURECA: "Yes",
    category: "Hardware & Software (Mostly Software)",
    type: "Research & Development",
    keywords: [
      "Artificial Intelligence",
      "Bioinformatics",
      "Biomedical Systems",
      "Human Computer Interaction",
      "Medical Informatics"
    ],
    score: 0.7254
  }
];

// Load environment variables - in Next.js these would typically come from .env.local
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const INDEX_NAME = process.env.INDEX_NAME || "fyp-projects";
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-ada-002";

// Initialize OpenAI client
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
    // Check if we have required API keys
    const usingMockData = !PINECONE_API_KEY || !OPENAI_API_KEY;
    
    if (usingMockData) {
      console.log("API keys not configured. Using mock data for search.");
      
      // Process mock data with basic filtering and scoring
      let filteredResults = [...mockProjects];
      
      // Apply filters to mock data
      if (filters.category) {
        filteredResults = filteredResults.filter(project => 
          project.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      if (filters.type) {
        filteredResults = filteredResults.filter(project => 
          project.type.toLowerCase().includes(filters.type.toLowerCase())
        );
      }
      
      if (filters.supervisor && filters.supervisor.$eq) {
        filteredResults = filteredResults.filter(project => 
          project.supervisor.toLowerCase().includes(filters.supervisor.$eq.toLowerCase())
        );
      }
      
      if (filters.isJointOrURECA && filters.isJointOrURECA.$ne === "No") {
        filteredResults = filteredResults.filter(project => 
          project.isJointOrURECA !== "No"
        );
      }
      
      // Simple relevance scoring based on query terms
      if (queryText.trim() !== '') {
        const queryTerms = queryText.toLowerCase().split(/\s+/);
        
        filteredResults = filteredResults.map(project => {
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
      filteredResults.sort((a, b) => b.score - a.score);
      
      // Return top K results
      return filteredResults.slice(0, topK);
    } else {
      // Use real semantic search with Pinecone and OpenAI
      // Initialize Pinecone and get index
      const index = await initializePinecone();
      
      // Generate query embedding
      const queryEmbedding = await createQueryEmbedding(queryText);
      
      // Prepare Pinecone filter if needed
      const pineconeFilter = {};
      
      if (filters.category) {
        pineconeFilter.category = filters.category;
      }
      
      if (filters.type) {
        pineconeFilter.type = filters.type;
      }
      
      if (filters.supervisor && filters.supervisor.$eq) {
        pineconeFilter.supervisor = filters.supervisor.$eq;
      }
      
      if (filters.isJointOrURECA && filters.isJointOrURECA.$ne === "No") {
        pineconeFilter.isJointOrURECA = { $ne: "No" };
      }
      
      // Query Pinecone
      const results = await index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
        filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined
      });
      
      // Format and return results
      return results.matches.map(match => ({
        projectNo: match.id,
        score: match.score,
        ...match.metadata
      }));
    }
  } catch (error) {
    console.error("Error in semantic search:", error);
    throw error;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Get query parameters
  const query = searchParams.get('query');
  if (!query) {
    return Response.json({ error: 'Query parameter is required' }, { status: 400 });
  }
  
  const category = searchParams.get('category');
  const type = searchParams.get('type');
  const supervisor = searchParams.get('supervisor');
  const isJointOrURECA = searchParams.get('joint') === 'true';
  const topK = parseInt(searchParams.get('top') || '20', 10);
  
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
    // Perform search
    const results = await semanticSearch(query, filters, topK);
    return Response.json({ results });
  } catch (error) {
    console.error('Error performing search:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Get parameters from request body
    const { query, filters = {}, topK = 20 } = body;
    
    if (!query) {
      return Response.json({ error: 'Query parameter is required' }, { status: 400 });
    }
    
    // Perform search
    const results = await semanticSearch(query, filters, topK);
    return Response.json({ results });
  } catch (error) {
    console.error('Error performing search:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}