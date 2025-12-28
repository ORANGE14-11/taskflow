/**
 * Storage Module - Handles all localStorage operations
 */
const Storage = {
    // Keys
    TASKS_KEY: 'taskflow_tasks',
    SETTINGS_KEY: 'taskflow_settings',
    ACTIVITY_KEY: 'taskflow_activity',

    // Default Settings
    defaultSettings: {
        theme: 'light',
        accentColor: '#6366f1',
        notifications: true,
        sounds: false
    },

    // Get all tasks
    getTasks() {
        const tasks = localStorage.getItem(this.TASKS_KEY);
        return tasks ? JSON.parse(tasks) : [];
    },

    // Save tasks
    saveTasks(tasks) {
        localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
    },

    // Add task
    addTask(task) {
        const tasks = this.getTasks();
        task.id = this.generateId();
        task.createdAt = new Date().toISOString();
        task.updatedAt = new Date().toISOString();
        tasks.push(task);
        this.saveTasks(tasks);
        this.addActivity('add', `Created task: ${task.title}`);
        return task;
    },

    // Update task
    updateTask(id, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() };
            this.saveTasks(tasks);
            this.addActivity('update', `Updated task: ${tasks[index].title}`);
            return tasks[index];
        }
        return null;
    },

    // Delete task
    deleteTask(id) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === id);
        const filtered = tasks.filter(t => t.id !== id);
        this.saveTasks(filtered);
        if (task) {
            this.addActivity('delete', `Deleted task: ${task.title}`);
        }
        return filtered;
    },

    // Get task by ID
    getTaskById(id) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === id);
    },

    // Get settings
    getSettings() {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        return settings ? JSON.parse(settings) : this.defaultSettings;
    },

    // Save settings
    saveSettings(settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
    },

    // Update setting
    updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        this.saveSettings(settings);
        return settings;
    },

    // Get activities
    getActivities() {
        const activities = localStorage.getItem(this.ACTIVITY_KEY);
        return activities ? JSON.parse(activities) : [];
    },

    // Add activity
    addActivity(type, message) {
        const activities = this.getActivities();
        activities.unshift({
            id: this.generateId(),
            type,
            message,
            timestamp: new Date().toISOString()
        });
        // Keep only last 50 activities
        const trimmed = activities.slice(0, 50);
        localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify(trimmed));
    },

    // Clear activities
    clearActivities() {
        localStorage.setItem(this.ACTIVITY_KEY, JSON.stringify([]));
    },

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Export data
    exportData() {
        const data = {
            tasks: this.getTasks(),
            settings: this.getSettings(),
            activities: this.getActivities(),
            exportedAt: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    },

    // Import data
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.tasks) this.saveTasks(data.tasks);
            if (data.settings) this.saveSettings(data.settings);
            return true;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    },

    // Clear all data
    clearAll() {
        localStorage.removeItem(this.TASKS_KEY);
        localStorage.removeItem(this.SETTINGS_KEY);
        localStorage.removeItem(this.ACTIVITY_KEY);
    },

    // Get task statistics
    getStats() {
        const tasks = this.getTasks();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'done').length,
            pending: tasks.filter(t => t.status === 'progress').length,
            overdue: tasks.filter(t => {
                if (!t.dueDate || t.status === 'done') return false;
                return new Date(t.dueDate) < today;
            }).length,
            todo: tasks.filter(t => t.status === 'todo').length,
            review: tasks.filter(t => t.status === 'review').length
        };
    }
};
