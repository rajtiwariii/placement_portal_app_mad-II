const AdminDashboard = {
    template: `
    <div>
        <h2 class="mb-4">Admin Dashboard</h2>
        
        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-4"><div class="card bg-info text-white p-3"><h5>Total Students</h5><h3>{{ stats.total_students }}</h3></div></div>
            <div class="col-md-4"><div class="card bg-success text-white p-3"><h5>Total Companies</h5><h3>{{ stats.total_companies }}</h3></div></div>
            <div class="col-md-4"><div class="card bg-primary text-white p-3"><h5>Total Drives</h5><h3>{{ stats.total_drives }}</h3></div></div>
        </div>

        <!-- Placement Drive Approvals -->
        <h4 class="mt-4">Placement Drive Approvals</h4>
        <table class="table table-bordered bg-white mb-5">
            <thead class="table-dark">
                <tr><th>Company</th><th>Job Title</th><th>Min CGPA</th><th>Branch</th><th>Deadline</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
                <tr v-for="d in drives" :key="d.id">
                    <td>{{ d.company_name }}</td>
                    <td>{{ d.job_title }}</td>
                    <td>{{ d.min_cgpa }}</td>
                    <td>{{ d.eligible_branch }}</td>
                    <td>{{ d.deadline }}</td>
                    <td><span class="badge" :class="d.status==='Approved'?'bg-success':'bg-warning'">{{ d.status }}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success me-1" @click="approveDrive(d.id, 'Approved')">Approve</button>
                        <button class="btn btn-sm btn-danger me-1" @click="approveDrive(d.id, 'Rejected')">Reject</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Company Approvals -->
        <h4>Company Approvals</h4>
        <table class="table table-bordered bg-white">
            <thead class="table-dark"><tr><th>Name</th><th>HR Contact</th><th>Website</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
                <tr v-for="c in companies" :key="c.id">
                    <td>{{ c.company_name }}</td>
                    <td>{{ c.hr_contact }}</td>
                    <td>{{ c.website }}</td>
                    <td><span class="badge" :class="c.approval_status==='Approved'?'bg-success':'bg-warning'">{{ c.approval_status }}</span></td>
                    <td>
                        <button class="btn btn-sm btn-success me-1" @click="approveCompany(c.id, 'Approved')">Approve</button>
                        <button class="btn btn-sm btn-danger me-1" @click="approveCompany(c.id, 'Rejected')">Reject</button>
                        <button class="btn btn-sm" :class="c.is_active?'btn-secondary':'btn-dark'" @click="toggleBlacklist(c.user_id)">
                            {{ c.is_active ? 'Blacklist' : 'Activate' }}
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    `,
    data() { 
        return { stats: {}, companies: [], drives: [] } 
    },
    async mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            const sRes = await fetch('/api/admin/dashboard-stats');
            this.stats = await sRes.json();
            
            const cRes = await fetch('/api/admin/companies');
            this.companies = await cRes.json();

            const dRes = await fetch('/api/admin/drives');
            this.drives = await dRes.json();
        },
        async approveCompany(id, status) {
            await fetch(`/api/admin/company/approve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            this.fetchData();
        },
        async approveDrive(id, status) {
            await fetch(`/api/admin/drive/approve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            this.fetchData();
        },
        async toggleBlacklist(userId) {
            await fetch(`/api/admin/toggle-blacklist/${userId}`, { method: 'POST' });
            this.fetchData();
        }
    }
};