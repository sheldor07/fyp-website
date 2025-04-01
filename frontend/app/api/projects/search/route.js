import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

// Load environment variables - in Next.js these would typically come from .env.local
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
const INDEX_NAME = process.env.INDEX_NAME;
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

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
async function semanticSearch(queryText, filters = null, topK = 20) {
  // Initialize Pinecone and get index
  const index = await initializePinecone();
  
  // Generate query embedding
  const queryEmbedding = await createQueryEmbedding(queryText);
  
  // Query Pinecone
  const filterDict = filters || {};
  const results = await index.query({
    vector: queryEmbedding,
    topK: topK,
    includeMetadata: true
  });
  
  // Return formatted results
  return results.matches.map(match => ({
    projectNo: match.id,
    score: match.score,
    ...match.metadata
  }));
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