/**
 * Charts Module - Handles all chart rendering
 */
const Charts = {
    progressChart: null,
    categoryChart: null,
    lineChart: null,
    priorityChart: null,

    // Initialize all charts
    init() {
        this.renderProgressChart();
        this.renderCategoryChart();
        this.renderLineChart();
        this.renderPriorityChart();
        this.updateProductivityScore();
    },

    // Update all charts
    update() {
        this.renderProgressChart();
        this.renderCategoryChart();
        this.renderLineChart();
        this.renderPriorityChart();
        this.updateProductivityScore();
    },

    // Progress Chart (Doughnut)
    renderProgressChart() {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;

        const stats = Storage.getStats();
        
        if (this.progressChart) {
            this.progressChart.destroy();
        }

        this.progressChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'To Do', 'Review'],
                datasets: [{
                    data: [stats.completed, stats.pending, stats.todo, stats.review],
                    backgroundColor: ['#10b981', '#f59e0b', '#6b7280', '#3b82f6'],
                    borderWidth: 0,
                    cutout: '70%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    },

    // Category Chart (Bar)
    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const tasks = Storage.getTasks();
        const categories = ['work', 'personal', 'shopping', 'health', 'finance'];
        const counts = categories.map(cat => 
            tasks.filter(t => t.category === cat).length
        );

        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        this.categoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Work', 'Personal', 'Shopping', 'Health', 'Finance'],
                datasets: [{
                    label: 'Tasks',
                    data: counts,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(139, 92, 246, 0.8)'
                    ],
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    // Line Chart (Task completion over time)
    renderLineChart() {
        const ctx = document.getElementById('lineChart');
        if (!ctx) return;

        const tasks = Storage.getTasks();
        const last7Days = [];
        const completedData = [];
        const createdData = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
            
            completedData.push(
                tasks.filter(t => 
                    t.status === 'done' && 
                    t.updatedAt && 
                    t.updatedAt.startsWith(dateStr)
                ).length
            );
            
            createdData.push(
                tasks.filter(t => 
                    t.createdAt && 
                    t.createdAt.startsWith(dateStr)
                ).length
            );
        }

        if (this.lineChart) {
            this.lineChart.destroy();
        }

        this.lineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days,
                datasets: [
                    {
                        label: 'Completed',
                        data: completedData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Created',
                        data: createdData,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    },

    // Priority Chart (Pie)
    renderPriorityChart() {
        const ctx = document.getElementById('priorityChart');
        if (!ctx) return;

        const tasks = Storage.getTasks();
        const high = tasks.filter(t => t.priority === 'high').length;
        const medium = tasks.filter(t => t.priority === 'medium').length;
        const low = tasks.filter(t => t.priority === 'low').length;

        if (this.priorityChart) {
            this.priorityChart.destroy();
        }

        this.priorityChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['High', 'Medium', 'Low'],
                datasets: [{
                    data: [high, medium, low],
                    backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    },

    // Update productivity score
    updateProductivityScore() {
        const stats = Storage.getStats();
        const score = stats.total > 0 
            ? Math.round((stats.completed / stats.total) * 100) 
            : 0;
        
        document.getElementById('productivityScore').textContent = score;
        
        // Animate the circle
        const circle = document.getElementById('scoreCircle');
        if (circle) {
            const circumference = 2 * Math.PI * 45;
            const offset = circumference - (score / 100) * circumference;
            circle.style.strokeDashoffset = offset;
        }
    }
};
