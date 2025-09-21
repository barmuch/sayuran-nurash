import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware(req) {
    console.log('Middleware called for:', req.nextUrl.pathname);
    console.log('Request headers:', req.headers.get('authorization'));
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        console.log('Authorization check for path:', req.nextUrl.pathname);
        console.log('Token received:', token);
        console.log('Token role:', token?.role);
        
        // Protect admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          const isAdmin = token?.role === 'admin';
          console.log('Admin check result:', isAdmin);
          return isAdmin;
        }
        
        // Protect user-specific routes
        if (req.nextUrl.pathname.startsWith('/cart') || 
            req.nextUrl.pathname.startsWith('/checkout') ||
            req.nextUrl.pathname.startsWith('/orders')) {
          const hasToken = !!token;
          console.log('User token check result:', hasToken);
          return hasToken;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/admin/:path*',
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*'
  ]
};
