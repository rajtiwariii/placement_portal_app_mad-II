const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/register-student', component: RegisterStudent },
    { path: '/register-company', component: RegisterCompany },
    { path: '/admin', component: AdminDashboard, meta: { role: 'admin' } },
    { path: '/company', component: CompanyDashboard, meta: { role: 'company' } },
    { path: '/student', component: StudentDashboard, meta: { role: 'student' } }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    const role = localStorage.getItem('role');
    if (to.meta.role && to.meta.role !== role) {
        next('/login');
    } else {
        next();
    }
});