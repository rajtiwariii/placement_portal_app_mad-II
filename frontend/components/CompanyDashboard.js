const CompanyDashboard = {
    template: `
    <div>
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2>Company Dashboard</h2>
            <button class="btn btn-primary" @click="showModal = true">
                + Create Placement Drive
            </button>
        </div>
        
        <h4>My Placement Drives</h4>
        <div class="row">
            <div class="col-md-6 mb-4" v-for="d in drives" :key="d.id">
                <div class="card shadow-sm border-0">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <h5 class="card-title text-primary mb-0">{{ d.job_title }}</h5>
                            <span class="badge" :class="d.status==='Approved'?'bg-success':'bg-warning text-dark'">{{ d.status }}</span>
                        </div>
                        <p class="card-text text-muted mb-2">{{ d.job_description }}</p>
                        <p class="mb-1"><strong>CGPA:</strong> {{ d.min_cgpa }} | <strong>Branch:</strong> {{ d.eligible_branch }}</p>
                        <p class="mb-3"><strong>Deadline:</strong> {{ d.deadline }} | <strong>Applicants:</strong> {{ d.applicant_count }}</p>
                        
                        <button class="btn btn-outline-info btn-sm w-100" @click="viewApplicants(d)">
                            View Applicants ({{ d.applicant_count }})
                        </button>
                    </div>
                </div>
            </div>
            <div v-if="drives.length === 0" class="col-12 text-muted">
                No drives created yet. Click "+ Create Placement Drive" to post a new job.
            </div>
        </div>

        <!-- Create Drive Modal -->
        <div v-if="showModal" class="modal d-block bg-dark bg-opacity-50">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Create Drive</h5>
                        <button type="button" class="btn-close" @click="showModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="createDrive">
                            <div class="mb-2"><label class="form-label">Job Title</label><input v-model="form.job_title" class="form-control" required></div>
                            <div class="mb-2"><label class="form-label">Description</label><textarea v-model="form.job_description" class="form-control" required></textarea></div>
                            <div class="mb-2"><label class="form-label">Min CGPA</label><input type="number" step="0.1" v-model="form.min_cgpa" class="form-control" required></div>
                            <div class="mb-2"><label class="form-label">Branch</label><input v-model="form.eligible_branch" class="form-control" required></div>
                            <div class="mb-2"><label class="form-label">Deadline</label><input type="date" v-model="form.deadline" class="form-control" required></div>
                            <div class="mt-3 text-end">
                                <button type="button" class="btn btn-secondary me-2" @click="showModal = false">Cancel</button>
                                <button type="submit" class="btn btn-success">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Applicants Modal -->
        <div v-if="showApplicantsModal" class="modal d-block bg-dark bg-opacity-50">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-dark text-white">
                        <h5 class="modal-title">Applicants for {{ selectedDrive ? selectedDrive.job_title : '' }}</h5>
                        <button type="button" class="btn-close btn-close-white" @click="showApplicantsModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="applicants.length === 0" class="text-center p-3 text-muted">
                            No students have applied to this drive yet.
                        </div>
                        <div v-else class="table-responsive">
                            <table class="table table-hover align-middle">
                                <thead>
                                    <tr>
                                        <th>Student Name</th>
                                        <th>Branch</th>
                                        <th>CGPA</th>
                                        <th>Resume</th>
                                        <th>Applied Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="app in applicants" :key="app.application_id">
                                        <td><strong>{{ app.student_name }}</strong></td>
                                        <td>{{ app.branch }}</td>
                                        <td><span class="badge bg-secondary">{{ app.cgpa }}</span></td>
                                        <td>
                                            <a v-if="app.resume_url" :href="app.resume_url" target="_blank" class="btn btn-sm btn-outline-primary">
                                                View Resume
                                            </a>
                                            <span v-else class="text-muted">No resume link</span>
                                        </td>
                                        <td>{{ app.application_date }}</td>
                                        <td>
                                            <span class="badge" :class="getStatusClass(app.status)">{{ app.status }}</span>
                                        </td>
                                        <td>
                                            <button class="btn btn-sm btn-success me-1" @click="updateStatus(app.application_id, 'Shortlisted')">Shortlist</button>
                                            <button class="btn btn-sm btn-danger" @click="updateStatus(app.application_id, 'Rejected')">Reject</button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        const profile = JSON.parse(localStorage.getItem('profile') || '{}');
        return {
            company_id: profile.company_id || profile.id,
            drives: [],
            applicants: [],
            selectedDrive: null,
            showModal: false,
            showApplicantsModal: false,
            form: { job_title: '', job_description: '', min_cgpa: 0, eligible_branch: 'All', deadline: '' }
        }
    },
    async mounted() { 
        this.fetchDrives(); 
    },
    methods: {
        async fetchDrives() {
            if (!this.company_id) return;
            const res = await fetch(`/api/company/drives/${this.company_id}`);
            if (res.ok) {
                this.drives = await res.json();
            }
        },
        async createDrive() {
            const res = await fetch('/api/company/drive/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...this.form, company_id: this.company_id })
            });
            if (res.ok) { 
                this.showModal = false; 
                this.form = { job_title: '', job_description: '', min_cgpa: 0, eligible_branch: 'All', deadline: '' };
                this.fetchDrives(); 
            } else { 
                alert((await res.json()).message); 
            }
        },
        async viewApplicants(drive) {
            this.selectedDrive = drive;
            const res = await fetch(`/api/company/applications/${drive.id}`);
            if (res.ok) {
                this.applicants = await res.json();
                this.showApplicantsModal = true;
            }
        },
        async updateStatus(appId, status) {
            const res = await fetch(`/api/company/application/status/${appId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                this.viewApplicants(this.selectedDrive);
            }
        },
        getStatusClass(status) {
            if (status === 'Shortlisted') return 'bg-success';
            if (status === 'Rejected') return 'bg-danger';
            return 'bg-warning text-dark';
        }
    }
};