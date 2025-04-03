import os
import argparse
from typing import Dict, List, Any, Optional
from pinecone import Pinecone
from openai import OpenAI

# Load environment variables
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
PINECONE_API_KEY = os.environ["PINECONE_API_KEY"]
PINECONE_ENVIRONMENT = os.environ.get("PINECONE_ENVIRONMENT", "gcp-starter")
INDEX_NAME = os.environ["INDEX_NAME"]
EMBEDDING_MODEL = os.environ["EMBEDDING_MODEL"]

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

def initialize_pinecone():
    """Initialize Pinecone and connect to index"""
    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY not found in environment variables")
        
    # Initialize Pinecone with the new API
    pc = Pinecone(api_key=PINECONE_API_KEY)
    
    # Check if index exists
    index_list = pc.list_indexes()
    if INDEX_NAME not in index_list.names():
        raise ValueError(f"Index '{INDEX_NAME}' not found in Pinecone")
    
    # Get index
    return pc.Index(INDEX_NAME)

def create_query_embedding(query_text: str) -> List[float]:
    """Generate embedding for a query string"""
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY not found in environment variables")
        
    response = client.embeddings.create(
        input=query_text,
        model=EMBEDDING_MODEL
    )
    return response.data[0].embedding

def semantic_search(
    query_text: str, 
    filters: Optional[Dict[str, Any]] = None, 
    top_k: int = 20
) -> List[Dict[str, Any]]:
    """Search for projects semantically similar to the query text"""
    # Initialize Pinecone and get index
    index = initialize_pinecone()
    
    # Generate query embedding
    query_embedding = create_query_embedding(query_text)
    
    # Query Pinecone
    filter_dict = {} if not filters else filters
    results = index.query(
        vector=query_embedding,
        filter=filter_dict,
        top_k=top_k,
        include_metadata=True
    )
    
    # Return formatted results
    return [
        {
            "projectNo": match.id,
            "score": match.score,
            **match.metadata
        }
        for match in results.matches
    ]

def print_results(results: List[Dict[str, Any]]):
    """Print search results in a readable format"""
    print(f"\nFound {len(results)} matching projects:")
    print("=" * 80)
    
    for i, result in enumerate(results):
        print(f"{i+1}. {result['title']} (Score: {result['score']:.4f})")
        print(f"   Project No: {result['projectNo']}")
        print(f"   Supervisor: {result['supervisor']}")
        print(f"   Category: {result['category']}")
        print(f"   Type: {result['type']}")
        print(f"   Keywords: {', '.join(result['keywords'])}")
        print("-" * 80)

def main():
    """Main function to handle command-line interface"""
    parser = argparse.ArgumentParser(description="Semantic search for projects")
    parser.add_argument("query", help="Natural language query text")
    parser.add_argument("--category", help="Filter by project category")
    parser.add_argument("--type", help="Filter by project type")
    parser.add_argument("--supervisor", help="Filter by supervisor")
    parser.add_argument("--joint", action="store_true", help="Filter for joint/URECA projects only")
    parser.add_argument("--top", type=int, default=20, help="Number of results to return (default: 20)")
    
    args = parser.parse_args()
    
    # Build filters
    filters = {}
    if args.category:
        filters["category"] = args.category
    if args.type:
        filters["type"] = args.type
    if args.supervisor:
        filters["supervisor"] = {"$eq": args.supervisor}
    if args.joint:
        filters["isJointOrURECA"] = {"$ne": "No"}
    
    # Perform search
    try:
        results = semantic_search(args.query, filters, args.top)
        print_results(results)
    except Exception as e:
        print(f"Error performing search: {e}")

if __name__ == "__main__":
    main()