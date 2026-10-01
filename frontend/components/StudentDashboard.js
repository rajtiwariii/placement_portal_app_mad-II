const StudentDashboard = {
    template: `
    <div>
        <h2 class="mb-4">Student Dashboard</h2>

        <!-- Profile Box -->
        <div class="card p-3 shadow-sm mb-4 bg-light">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h4>{{ profile.full_name || 'Student Profile' }} ({{ profile.roll_number || 'N/A' }})</h4>
                    <p class="mb-1"><strong>Branch:</strong> {{ profile.branch || 'N/A' }} | <strong>CGPA:</strong> {{ profile.cgpa }}</p>
                    <p class="mb-0" v-if="profile.resume_path || profile.resume_url">
                        <strong>Resume:</strong> 
                        <a :href="profile.resume_path || profile.resume_url" target="_blank" class="text-primary fw-bold">View Resume</a>
                    </p>
                    <p class="mb-0 text-muted" v-else>
                        <strong>Resume:</strong> No resume link added yet.
                    </p>
                </div>
                <button class="btn btn-outline-primary" @click="openEditModal">
                    Edit Profile
                </button>
            </div>
        </div>

        <h4>Eligible Placement Drives</h4>
        <div class="row mb-4">
            <div class="col-md-6 mb-3" v-for="d in drives" :key="d.id">
                <div class="card p-3 shadow-sm">
                    <h5>{{ d.company_name }} - {{ d.job_title }}</h5>
                    <p class="text-muted">{{ d.job_description }}</p>
                    <p><strong>Min CGPA:</strong> {{ d.min_cgpa }} | <strong>Branch:</strong> {{ d.eligible_branch }}</p>
                    <p><strong>Deadline:</strong> {{ d.deadline }}</p>
                    <button class="btn btn-primary" @click="applyForDrive(d.id)">Apply Now</button>
                </div>
            </div>
            <div v-if="drives.length === 0" class="col-12">
                <p class="text-muted">No eligible placement drives available right now.</p>
            </div>
        </div>

        <h4>My Application History</h4>
        <table class="table table-bordered bg-white shadow-sm align-middle">
            <thead class="table-dark">
                <tr>
                    <th>Company</th>
                    <th>Job Title</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="a in applications" :key="a.id">
                    <td>{{ a.company_name }}</td>
                    <td>{{ a.job_title }}</td>
                    <td><strong>{{ a.applied_date }}</strong></td>
                    <td><span class="badge bg-success">{{ a.status }}</span></td>
                </tr>
                <tr v-if="applications.length === 0">
                    <td colspan="4" class="text-center text-muted">You have not applied for any drives yet.</td>
                </tr>
            </tbody>
        </table>

        <!-- Profile Edit Modal -->
        <div v-if="showProfileModal" class="modal d-block bg-dark bg-opacity-50">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Edit Profile</h5>
                        <button type="button" class="btn-close" @click="showProfileModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveProfile">
                            <div class="mb-3">
                                <label class="form-label">Full Name</label>
                                <input v-model="editForm.full_name" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Roll Number</label>
                                <input v-model="editForm.roll_number" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Branch</label>
                                <input v-model="editForm.branch" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">CGPA</label>
                                <input type="number" step="0.01" min="0" max="10" v-model="editForm.cgpa" class="form-control" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Resume Link (URL)</label>
                                <input v-model="editForm.resume_path" class="form-control" placeholder="https://drive.google.com/...">
                            </div>
                            <div class="d-flex justify-content-end">
                                <button type="button" class="btn btn-secondary me-2" @click="showProfileModal = false">Cancel</button>
                                <button type="submit" class="btn btn-success">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        const storedProfile = JSON.parse(localStorage.getItem('profile') || '{}');
        return {
            profile: storedProfile,
            student_id: storedProfile.student_id || storedProfile.id,
            drives: [],
            applications: [],
            showProfileModal: false,
            editForm: { full_name: '', roll_number: '', branch: '', cgpa: 0, resume_path: '' }
        }
    },
    async mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            if (!this.student_id) return;

            const profileRes = await fetch(`/api/student/profile/${this.student_id}`);
            if (profileRes.ok) {
                this.profile = await profileRes.json();
                localStorage.setItem('profile', JSON.stringify(this.profile));
            }

            const dRes = await fetch(`/api/student/drives/${this.student_id}`);
            this.drives = await dRes.json();
            
            const aRes = await fetch(`/api/student/applications/${this.student_id}`);
            this.applications = await aRes.json();
        },
        openEditModal() {
            this.editForm = {
                full_name: this.profile.full_name || '',
                roll_number: this.profile.roll_number || '',
                branch: this.profile.branch || '',
                cgpa: this.profile.cgpa || 0,
                resume_path: this.profile.resume_path || this.profile.resume_url || ''
            };
            this.showProfileModal = true;
        },
        async saveProfile() {
            const res = await fetch(`/api/student/profile/update/${this.student_id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.editForm)
            });
            if (res.ok) {
                const data = await res.json();
                alert(data.message);
                this.profile = { ...this.profile, ...data.profile };
                localStorage.setItem('profile', JSON.stringify(this.profile));
                this.showProfileModal = false;
                this.fetchData();
            } else {
                alert("Failed to update profile.");
            }
        },
        async applyForDrive(driveId) {
            const res = await fetch('/api/student/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ student_id: this.student_id, drive_id: driveId })
            });
            const data = await res.json();
            alert(data.message);
            this.fetchData();
        }
    }
};