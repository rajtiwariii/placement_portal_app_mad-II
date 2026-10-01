const NavbarComponent = {
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand fw-bold" href="#">🎓 Placement Portal</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-row navbar-nav me-auto mb-2 mb-lg-0" v-if="role">
                    <li class="nav-item" v-if="role === 'admin'">
                        <router-link class="nav-link" to="/admin">Admin Dashboard</router-link>
                    </li>
                    <li class="nav-item" v-if="role === 'company'">
                        <router-link class="nav-link" to="/company">Company Dashboard</router-link>
                    </li>
                    <li class="nav-item" v-if="role === 'student'">
                        <router-link class="nav-link" to="/student">Student Dashboard</router-link>
                    </li>
                </ul>
                <div class="d-flex" v-if="role">
                    <span class="navbar-text me-3 text-light">Logged in as: <strong>{{ email }}</strong> ({{ role.toUpperCase() }})</span>
                    <button class="btn btn-outline-danger btn-sm" @click="logout">Logout</button>
                </div>
                <div class="d-flex" v-else>
                    <router-link class="btn btn-outline-light btn-sm me-2" to="/login">Login</router-link>
                    <router-link class="btn btn-primary btn-sm me-2" to="/register-student">Register Student</router-link>
                    <router-link class="btn btn-warning btn-sm" to="/register-company">Register Company</router-link>
                </div>
            </div>
        </div>
    </nav>
    `,
    data() {
        return {
            role: localStorage.getItem('role') || null,
            email: localStorage.getItem('email') || ''
        }
    },
    methods: {
        logout() {
            localStorage.clear();
            this.$router.push('/login').then(() => { window.location.reload(); });
        }
    }
};