/**
 * Main Application Module
 */
const App = {
    currentPage: 'dashboard',
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),

    // Initialize app
    init() {
        this.loadTheme();
        this.bindEvents();
        this.loadData();
        Charts.init();
        UI.renderCalendar(this.currentYear, this.currentMonth);
        
        console.log('🚀 TaskFlow initialized successfully!');
    },

    // Bind all event listeners
    bindEvents() {
        // Sidebar toggle
        document.getElementById('sidebarToggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('collapsed');
        });

        // Mobile menu
        document.getElementById('mobileMenuBtn').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Navigation
        document.querySelectorAll('.sidebar-nav li').forEach(item => {
            item.addEventListener('click', () => {
                this.navigateTo(item.dataset.page);
            });
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.setTheme(e.target.checked ? 'dark' : 'light');
        });

        // Add task buttons
        document.getElementById('addTaskBtn').addEventListener('click', () => UI.openModal());
        document.getElementById('addTaskBtn2')?.addEventListener('click', () => UI.openModal());
        
        document.querySelectorAll('.add-task-col').forEach(btn => {
            btn.addEventListener('click', () => {
                UI.openModal();
                document.getElementById('taskStatus').value = btn.dataset.status;
            });
        });

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => UI.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => UI.closeModal());
        
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') UI.closeModal();
        });

        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTask();
        });

        // Tags input
        document.getElementById('tagInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const value = e.target.value.trim();
                if (value) {
                    UI.addTag(value);
                    e.target.value = '';
                }
            }
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchTasks(e.target.value);
        });

        // Filters
        ['filterStatus', 'filterPriority', 'filterCategory'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => {
                this.applyFilters();
            });
        });

        // Settings - Export
        document.getElementById('exportBtn')?.addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('exportData')?.addEventListener('click', () => {
            this.exportData();
        });

        // Settings - Import
        document.getElementById('importBtn')?.addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Settings - Delete all
        document.getElementById('deleteAllBtn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                Storage.clearAll();
                this.loadData();
                Charts.update();
                UI.showToast('success', 'Data Deleted', 'All data has been deleted');
            }
        });

        // Clear activity
        document.getElementById('clearActivityBtn')?.addEventListener('click', () => {
            Storage.clearActivities();
            UI.renderActivities([]);
            UI.showToast('success', 'Activity Cleared', 'All activity has been cleared');
        });

        // Calendar navigation
        document.getElementById('prevMonth')?.addEventListener('click', () => {
            this.currentMonth--;
            if (this.currentMonth < 0) {
                this.currentMonth = 11;
                this.currentYear--;
            }
            UI.renderCalendar(this.currentYear, this.currentMonth);
        });

        document.getElementById('nextMonth')?.addEventListener('click', () => {
            this.currentMonth++;
            if (this.currentMonth > 11) {
                this.currentMonth = 0;
                this.currentYear++;
            }
            UI.renderCalendar(this.currentYear, this.currentMonth);
        });

        // Color options
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.documentElement.style.setProperty('--primary', btn.dataset.color);
                Storage.updateSetting('accentColor', btn.dataset.color);
            });
        });
    },

    // Navigate to page
    navigateTo(page) {
        document.querySelectorAll('.sidebar-nav li').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) item.classList.add('active');
        });

        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        document.getElementById(`${page}Page`)?.classList.add('active');
        this.currentPage = page;

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('active');
    },

    // Load all data
    loadData() {
        const tasks = Storage.getTasks();
        const stats = Storage.getStats();
        const activities = Storage.getActivities();

        UI.renderKanban(tasks);
        UI.renderTasksTable(tasks);
        UI.renderActivities(activities);
        UI.updateStats(stats);
    },

    // Save task
    saveTask() {
        const id = document.getElementById('taskId').value;
        const taskData = {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            category: document.getElementById('taskCategory').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            status: document.getElementById('taskStatus').value,
            tags: UI.getTags()
        };

        if (id) {
            Storage.updateTask(id, taskData);
            UI.showToast('success', 'Task Updated', 'Your task has been updated successfully');
        } else {
            Storage.addTask(taskData);
            UI.showToast('success', 'Task Created', 'Your task has been created successfully');
        }

        UI.closeModal();
        this.loadData();
        Charts.update();
    },

    // Update task status (drag and drop)
    updateTaskStatus(taskId, newStatus) {
        Storage.updateTask(taskId, { status: newStatus });
        
        if (newStatus === 'done') {
            Storage.addActivity('complete', 'Completed a task');
        }
        
        this.loadData();
        Charts.update();
        UI.showToast('success', 'Task Moved', `Task moved to ${newStatus}`);
    },

    // Delete task
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            Storage.deleteTask(taskId);
            this.loadData();
            Charts.update();
            UI.showToast('success', 'Task Deleted', 'Your task has been deleted');
        }
    },

    // Show task menu
    showTaskMenu(taskId) {
        // For now, just open edit modal
        UI.openModal(taskId);
    },

    // Search tasks
    searchTasks(query) {
        const tasks = Storage.getTasks();
        const filtered = tasks.filter(task => 
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
        );
        UI.renderKanban(filtered);
        UI.renderTasksTable(filtered);
    },

    // Apply filters
    applyFilters() {
        const status = document.getElementById('filterStatus')?.value || 'all';
        const priority = document.getElementById('filterPriority')?.value || 'all';
        const category = document.getElementById('filterCategory')?.value || 'all';

        let tasks = Storage.getTasks();

        if (status !== 'all') {
            tasks = tasks.filter(t => t.status === status);
        }
        if (priority !== 'all') {
            tasks = tasks.filter(t => t.priority === priority);
        }
        if (category !== 'all') {
            tasks = tasks.filter(t => t.category === category);
        }

        UI.renderTasksTable(tasks);
    },

    // Theme management
    loadTheme() {
        const settings = Storage.getSettings();
        
