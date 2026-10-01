const RegisterStudent = {
    template: `
    <div class="row justify-content-center mt-4">
        <div class="col-md-6">
            <div class="card shadow">
                <div class="card-header bg-success text-white"><h4>Student Registration</h4></div>
                <div class="card-body">
                    <div v-if="msg" class="alert" :class="isError ? 'alert-danger' : 'alert-success'">{{ msg }}</div>
                    <form @submit.prevent="register">
                        <div class="mb-2"><label>Full Name</label><input type="text" v-model="form.full_name" class="form-control" required></div>
                        <div class="mb-2"><label>Roll Number</label><input type="text" v-model="form.roll_number" class="form-control" required></div>
                        <div class="mb-2"><label>Branch</label><input type="text" v-model="form.branch" class="form-control" placeholder="e.g. CSE, ECE" required></div>
                        <div class="mb-2"><label>CGPA</label><input type="number" step="0.01" v-model="form.cgpa" class="form-control" required></div>
                        <div class="mb-2"><label>Email</label><input type="email" v-model="form.email" class="form-control" required></div>
                        <div class="mb-3"><label>Password</label><input type="password" v-model="form.password" class="form-control" required></div>
                        <button type="submit" class="btn btn-success w-100">Register</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            form: { full_name: '', roll_number: '', branch: '', cgpa: '', email: '', password: '' },
            msg: '', isError: false
        }
    },
    methods: {
        async register() {
            const res = await fetch('/api/auth/register/student', {
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