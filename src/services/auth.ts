// Simple demo authentication for hackathon
export const DemoAuth = {
  currentUser: null as { id: string; email: string; name: string } | null,

  async signIn(email: string = 'demo@macrofolio.com', password: string = 'demo123') {
    this.currentUser = {
      id: 'demo-user-123',
      email,
      name: 'Demo Investor'
    };
    console.log('Demo user logged in:', this.currentUser.email);
    return { user: this.currentUser, error: null };
  },

  async signUp(email: string, password: string, name: string) {
    this.currentUser = { id: 'demo-user-' + Date.now(), email, name };
    return { user: this.currentUser, error: null };
  },

  async signOut() {
    this.currentUser = null;
    return { error: null };
  },

  async getCurrentUser() {
    return this.currentUser;
  },

  isAuthenticated() {
    return this.currentUser !== null;
  }
};

export default DemoAuth;
