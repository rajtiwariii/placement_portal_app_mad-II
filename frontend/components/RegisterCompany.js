const RegisterCompany = {
    template: `
    <div class="row justify-content-center mt-4">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-header bg-warning text-dark"><h4>Company Registration</h4></div>
                <div class="card-body">
                    <div v-if="msg" class="alert" :class="isError ? 'alert-danger' : 'alert-success'">{{ msg }}</div>
                    <form @submit.prevent="register">
                        <div class="mb-2"><label>Company Name</label><input type="text" v-model="form.company_name" class="form-control" required></div>
                        <div class="mb-2"><label>HR Contact Email/Phone</label><input type="text" v-model="form.hr_contact" class="form-control" required></div>
                        <div class="mb-2"><label>Website</label><input type="text" v-model="form.website" class="form-control"></div>
                        <div class="mb-2"><label>Login Email</label><input type="email" v-model="form.email" class="form-control" required></div>
                        <div class="mb-3"><label>Password</label><input type="password" v-model="form.password" class="form-control" required></div>
                        <button type="submit" class="btn btn-warning w-100">Register Profile</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            form: { company_name: '', hr_contact: '', website: '', email: '', password: '' },
            msg: '', isError: false
        }
    },
    methods: {
        async register() {
            const res = await fetch('/api/auth/register/company', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.form)
            });
            const data = await res.json();
            if (res.ok) {
                this.isError = false; this.msg = data.message + ' Redirecting to login...';
                setTimeout(() => this.$router.push('/login'), 1500);
            } else {
                this.isError = true; this.msg = data.message;
            }
        }
    }
};