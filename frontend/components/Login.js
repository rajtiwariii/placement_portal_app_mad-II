const Login = {
    template: `
    <div class="row justify-content-center mt-5">
        <div class="col-md-5">
            <div class="card shadow">
                <div class="card-header bg-primary text-white text-center">
                    <h4>User Login</h4>
                </div>
                <div class="card-body">
                    <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
                    <form @submit.prevent="handleLogin">
                        <div class="mb-3">
                            <label class="form-label">Email address</label>
                            <input type="email" class="form-control" v-model="email" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Password</label>
                            <input type="password" class="form-control" v-model="password" required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100">Login</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            email: '',
            password: '',
            errorMessage: ''
        }
    },
    methods: {
        async handleLogin() {
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password })
                });
                const data = await res.json();
                if (!res.ok) {
                    this.errorMessage = data.message || 'Login failed';
                    return;
                }
                localStorage.setItem('token', data.auth_token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('email', data.email);
                
                if (data.profile) {
                    localStorage.setItem('profile', JSON.stringify(data.profile));
                }

                if (data.role === 'admin') this.$router.push('/admin');
                else if (data.role === 'company') this.$router.push('/company');
                else if (data.role === 'student') this.$router.push('/student');
                
                setTimeout(() => window.location.reload(), 100);
            } catch (err) {
                this.errorMessage = 'Server connection error';
            }
        }
    }
};