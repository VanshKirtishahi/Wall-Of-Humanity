export const authHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return {
      'Content-Type': 'application/json'
    };
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}; 