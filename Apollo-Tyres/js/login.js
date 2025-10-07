/**
 * LOGIN.JS - Apollo Tyres R&D Authentication
 * Handles user login, token management, and role-based redirects
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');

  // Guard clause - ensure form exists
  if (!form) {
    console.error('Login form not found');
    return;
  }

  // ============================================
  // FORM SUBMISSION HANDLER
  // ============================================
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    
    // Clear previous errors
    if (errorMessage) errorMessage.textContent = '';
    
    // Get input values
    const email = (emailInput?.value || '').trim();
    const password = (passwordInput?.value || '').trim();

    // Validation
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    // Disable submit button during request
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.innerHTML = '<span>Logging in...</span>';
    }

    try {
      // API call
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // Parse response
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid server response');
      }

      // Handle error responses
      if (!response.ok) {
        const errorMsg = data.message || data.error || `Login failed (${response.status})`;
        throw new Error(errorMsg);
      }

      // Validate token presence
      const token = data.token || '';
      if (!token) {
        throw new Error('Authentication token not received');
      }

      console.log('✅ Login successful:', {
        email,
        hasToken: !!token,
        userData: data.user ? 'present' : 'missing'
      });

      // ============================================
      // PERSIST USER DATA TO LOCALSTORAGE
      // ============================================
      
      // Always save token
      localStorage.setItem('authToken', token);
      console.log('✓ Saved authToken');

      // Save user data if available
      if (data.user) {
        // Email (CRITICAL for project filtering)
        if (data.user.email) {
          localStorage.setItem('userEmail', data.user.email);
          console.log('✓ Saved userEmail:', data.user.email);
        } else {
          // Fallback: use login email if server doesn't return it
          localStorage.setItem('userEmail', email);
          console.log('⚠ Using login email as fallback:', email);
        }

        // Name
        if (data.user.name) {
          localStorage.setItem('userName', data.user.name);
          console.log('✓ Saved userName:', data.user.name);
        }

        // Role
        if (data.user.role) {
          localStorage.setItem('userRole', data.user.role);
          console.log('✓ Saved userRole:', data.user.role);
        }

        // ID (if available)
        if (data.user.id) {
          localStorage.setItem('userId', data.user.id);
          console.log('✓ Saved userId:', data.user.id);
        }
      } else {
        // Fallback if no user object in response
        console.warn('⚠ No user object in response, using fallbacks');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', email.split('@')[0]); // Use email prefix as name
      }

      // ============================================
      // DETERMINE USER ROLE FOR REDIRECT
      // ============================================
      let role = 'engineer'; // Default role

      // Priority 1: Check data.role (direct property)
      if (data.role) {
        role = data.role.toString().toLowerCase().trim();
      }
      // Priority 2: Check data.user.role
      else if (data.user?.role) {
        role = data.user.role.toString().toLowerCase().trim();
      }
      // Priority 3: Decode JWT token
      else {
        try {
          const payload = JSON.parse(
            atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          );
          role = (
            payload.role || 
            payload.userRole || 
            payload.roleName || 
            'engineer'
          ).toString().toLowerCase().trim();
        } catch (decodeError) {
          console.warn('Token decode failed, using default role:', decodeError);
        }
      }

      console.log('🎯 User role determined:', role);

      // ============================================
      // VERIFY LOCALSTORAGE BEFORE REDIRECT
      // ============================================
      const verification = {
        authToken: localStorage.getItem('authToken') ? '✓' : '✗',
        userEmail: localStorage.getItem('userEmail') || '✗',
        userName: localStorage.getItem('userName') || '✗',
        userRole: localStorage.getItem('userRole') || '✗'
      };
      
      console.log('📦 LocalStorage verification:', verification);

      // Critical check: ensure email is saved
      if (!localStorage.getItem('userEmail')) {
        console.error('❌ CRITICAL: userEmail not saved! Forcing fallback...');
        localStorage.setItem('userEmail', email);
      }

      // Small delay to ensure localStorage is fully written
      await new Promise(resolve => setTimeout(resolve, 150));

      // ============================================
      // ROLE-BASED REDIRECT
      // ============================================
      let redirectUrl = '/user-dashboard.html'; // Default for engineers

      if (role === 'manager' || role === 'admin') {
        redirectUrl = '/manager-dashboard.html';
      }

      console.log('🚀 Redirecting to:', redirectUrl);
      window.location.href = redirectUrl;

    } catch (error) {
      console.error('❌ Login error:', error);
      showError(error.message || 'An error occurred during login. Please try again.');
      
      // Re-enable button
      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<span>Login</span><i class="fas fa-arrow-right"></i>';
      }
    }
  });

  // ============================================
  // PASSWORD VISIBILITY TOGGLE
  // ============================================
  const togglePassword = document.querySelector('.toggle-password');
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle icon
      this.classList.toggle('fa-eye');
      this.classList.toggle('fa-eye-slash');
    });
  }

  // ============================================
  // REMEMBER ME FUNCTIONALITY (OPTIONAL)
  // ============================================
  const rememberCheckbox = document.getElementById('remember');
  
  // Load saved email if "Remember Me" was checked
  const savedEmail = localStorage.getItem('rememberedEmail');
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberCheckbox) rememberCheckbox.checked = true;
  }

  // Save email if "Remember Me" is checked
  if (rememberCheckbox) {
    form.addEventListener('submit', () => {
      if (rememberCheckbox.checked && emailInput) {
        localStorage.setItem('rememberedEmail', emailInput.value);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
    });
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  /**
   * Display error message to user
   */
  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 5000);
    } else {
      alert(message);
    }
  }

  // ============================================
  // AUTO-LOGOUT ON SESSION EXPIRY (OPTIONAL)
  // ============================================
  
  // Check if token is expired on page load
  const token = localStorage.getItem('authToken');
  if (token) {
    try {
      const payload = JSON.parse(
        atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
      );
      
      if (payload.exp) {
        const isExpired = Date.now() >= payload.exp * 1000;
        
        if (isExpired) {
          console.warn('Token expired, clearing session...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userName');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userId');
          
          if (errorMessage) {
            errorMessage.textContent = 'Session expired. Please login again.';
          }
        } else {
          // Token valid, redirect if already logged in
          const currentPage = window.location.pathname;
          if (currentPage === '/login.html' || currentPage === '/') {
            const userRole = localStorage.getItem('userRole') || 'engineer';
            const redirectUrl = userRole.toLowerCase() === 'manager' 
              ? '/manager-dashboard.html' 
              : '/user-dashboard.html';
            
            console.log('User already logged in, redirecting...');
            window.location.href = redirectUrl;
          }
        }
      }
    } catch (e) {
      console.error('Token validation error:', e);
    }
  }

  // ============================================
  // ENTER KEY SUPPORT
  // ============================================
  
  // Allow Enter key on password field
  if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        form.dispatchEvent(new Event('submit'));
      }
    });
  }

  console.log('✅ Login page initialized');
});

// ============================================
// GLOBAL LOGOUT FUNCTION (for other pages)
// ============================================

/**
 * Global logout function callable from any page
 */
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    // Clear all auth data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    
    // Redirect to login
    window.location.href = '/login.html';
  }
};

// ============================================
// DEBUG HELPER (REMOVE IN PRODUCTION)
// ============================================

// Log storage state on any key change (for debugging)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  window.addEventListener('storage', (e) => {
    console.log('🔄 Storage changed:', {
      key: e.key,
      oldValue: e.oldValue,
      newValue: e.newValue
    });
  });
}