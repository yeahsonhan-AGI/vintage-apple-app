import { supabase, auth } from './supabase-client.js'

// Auth state
let currentUser = null

// Initialize auth
export async function initAuth() {
    // Check for existing session
    const { data: { session } } = await supabase.auth.getSession()

    if (session?.user) {
        currentUser = session.user
        showMainApp()
    } else {
        showAuthScreen()
    }

    // Listen to auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
        currentUser = session?.user || null

        if (currentUser) {
            showMainApp()
        } else {
            showAuthScreen()
        }
    })

    setupAuthForms()
}

function showAuthScreen() {
    document.getElementById('authScreen').style.display = 'flex'
    document.getElementById('mainApp').style.display = 'none'
}

function showMainApp() {
    document.getElementById('authScreen').style.display = 'none'
    document.getElementById('mainApp').style.display = 'block'

    // Update user info
    if (currentUser) {
        document.getElementById('userEmail').textContent = currentUser.email
    }
}

function setupAuthForms() {
    // Tab switching
    const tabs = document.querySelectorAll('.auth-tab')
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab

            // Update tabs
            tabs.forEach(t => t.classList.remove('active'))
            tab.classList.add('active')

            // Update forms
            document.querySelectorAll('.auth-form-content').forEach(form => {
                form.classList.remove('active')
            })
            document.getElementById(`${tabName}Form`).classList.add('active')
        })
    })

    // Sign in form
    document.getElementById('signinForm').addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = document.getElementById('signinEmail').value
        const password = document.getElementById('signinPassword').value

        showAuthLoading()

        const { data, error } = await auth.signIn(email, password)

        if (error) {
            showAuthError(error.message)
        } else {
            showAuthSuccess('Welcome back! 🎉')
            // Auth state change will handle redirect
        }
    })

    // Sign up form
    document.getElementById('signupForm').addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = document.getElementById('signupEmail').value
        const password = document.getElementById('signupPassword').value
        const confirmPassword = document.getElementById('signupConfirmPassword').value

        if (password.length < 6) {
            showAuthError('Password must be at least 6 characters')
            return
        }

        if (password !== confirmPassword) {
            showAuthError('Passwords do not match')
            return
        }

        showAuthLoading()

        const { data, error } = await auth.signUp(email, password)

        if (error) {
            showAuthError(error.message)
        } else {
            showAuthSuccess('Account created! Check your email to confirm 📧')
        }
    })
}

function showAuthLoading() {
    const btn = document.querySelector('.auth-form-content.active .auth-btn')
    btn.disabled = true
    btn.textContent = 'Loading...'
    hideAuthMessages()
}

function showAuthError(message) {
    const errorEl = document.getElementById('authError')
    errorEl.textContent = message
    errorEl.classList.add('show')

    const btn = document.querySelector('.auth-form-content.active .auth-btn')
    btn.disabled = false
    btn.textContent = btn.parentElement.id === 'signinForm' ? 'Sign In 🚀' : 'Create Account ✨'
}

function showAuthSuccess(message) {
    const successEl = document.getElementById('authSuccess')
    successEl.textContent = message
    successEl.classList.add('show')

    const btn = document.querySelector('.auth-form-content.active .auth-btn')
    btn.disabled = false
    btn.textContent = btn.parentElement.id === 'signinForm' ? 'Sign In 🚀' : 'Create Account ✨'
}

function hideAuthMessages() {
    document.getElementById('authError').classList.remove('show')
    document.getElementById('authSuccess').classList.remove('show')
}

// Sign out handler
export async function handleSignOut() {
    const { error } = await auth.signOut()

    if (error) {
        showToast('Failed to sign out 😢')
    } else {
        showToast('Signed out successfully 👋')
    }

    closeUserDropdown()
}

// User menu
export function setupUserMenu() {
    const userBtn = document.getElementById('userBtn')
    const userDropdown = document.getElementById('userDropdown')

    userBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        userDropdown.classList.toggle('show')
    })

    document.addEventListener('click', () => {
        userDropdown.classList.remove('show')
    })
}

export function closeUserDropdown() {
    document.getElementById('userDropdown').classList.remove('show')
}

// Get current user
export function getCurrentUser() {
    return currentUser
}

// Check if user is authenticated
export function isAuthenticated() {
    return currentUser !== null
}
