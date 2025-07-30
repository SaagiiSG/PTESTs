// Utility function to get API URL
export function getApiUrl(path: string): string {
  // In client-side, we'll use relative URLs
  if (typeof window !== 'undefined') {
    return path;
  }
  
  // In server-side, we need to construct the full URL
  // This will be handled by the server components
  return path;
}

// Client-side API functions
export async function fetchCourses() {
  try {
    const res = await fetch('/api/courses', { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

export async function fetchTests() {
  try {
    const res = await fetch('/api/tests', { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching tests:', error);
    return [];
  }
}

export async function fetchUsers() {
  try {
    const res = await fetch('/api/user', { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function fetchPurchaseHistory() {
  try {
    const res = await fetch('/api/profile/purchase-history', { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    return [];
  }
} 