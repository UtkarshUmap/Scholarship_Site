export const clearAllTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('admin');
  localStorage.removeItem('studentToken');
  localStorage.removeItem('student');
  localStorage.removeItem('academicsToken');
  localStorage.removeItem('academics');
};

export const clearOtherTokens = (exceptTokenKey) => {
  const allTokens = {
    token: ['token', 'admin'],
    studentToken: ['studentToken', 'student'],
    academicsToken: ['academicsToken', 'academics']
  };
  
  Object.keys(allTokens).forEach(key => {
    if (key !== exceptTokenKey) {
      allTokens[key].forEach(item => localStorage.removeItem(item));
    }
  });
};
