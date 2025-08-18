class FitKyungApp {
    constructor() {
        this.members = [];
        this.workouts = [];
        this.currentDate = new Date();
        this.memberColors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
            '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
        ];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderMembers();
        this.renderCalendar();
        this.updateMemberSelect();
    }

    setupEventListeners() {
        // 탭 전환
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 멤버 추가
        document.getElementById('addMemberBtn').addEventListener('click', () => {
            document.getElementById('memberForm').style.display = 'flex';
        });

        document.getElementById('saveMemberBtn').addEventListener('click', () => {
            this.addMember();
        });

        document.getElementById('cancelMemberBtn').addEventListener('click', () => {
            document.getElementById('memberForm').style.display = 'none';
            document.getElementById('nickname').value = '';
        });

        // 운동 추가
        document.getElementById('workoutForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addWorkout();
        });

        // 사진 미리보기
        document.getElementById('workoutPhoto').addEventListener('change', (e) => {
            this.previewPhoto(e.target.files[0]);
        });

        // 캘린더 네비게이션
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // 모달 닫기
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('photoModal').style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('photoModal')) {
                document.getElementById('photoModal').style.display = 'none';
            }
        });
    }

    switchTab(tabName) {
        // 모든 탭 비활성화
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 선택된 탭 활성화
        document.getElementById(tabName).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        if (tabName === 'calendar') {
            this.renderCalendar();
        }
    }

    addMember() {
        const nickname = document.getElementById('nickname').value.trim();
        if (!nickname) {
            alert('닉네임을 입력해주세요.');
            return;
        }

        if (this.members.find(m => m.nickname === nickname)) {
            alert('이미 존재하는 닉네임입니다.');
            return;
        }

        const member = {
            id: Date.now(),
            nickname: nickname,
            color: this.memberColors[this.members.length % this.memberColors.length],
            createdAt: new Date().toISOString()
        };

        this.members.push(member);
        this.saveData();
        this.renderMembers();
        this.updateMemberSelect();
        
        document.getElementById('memberForm').style.display = 'none';
        document.getElementById('nickname').value = '';
        
        alert('멤버가 성공적으로 등록되었습니다!');
    }

    addWorkout() {
        const memberId = document.getElementById('memberSelect').value;
        const date = document.getElementById('workoutDate').value;
        const photoFile = document.getElementById('workoutPhoto').files[0];

        if (!memberId || !date || !photoFile) {
            alert('모든 필드를 입력해주세요.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const workout = {
                id: Date.now(),
                memberId: parseInt(memberId),
                date: date,
                photo: e.target.result,
                createdAt: new Date().toISOString()
            };

            this.workouts.push(workout);
            this.saveData();
            this.renderCalendar();
            
            // 폼 초기화
            document.getElementById('workoutForm').reset();
            document.getElementById('photoPreview').innerHTML = '';
            
            alert('운동이 성공적으로 등록되었습니다!');
        };
        reader.readAsDataURL(photoFile);
    }

    previewPhoto(file) {
        const preview = document.getElementById('photoPreview');
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.innerHTML = `<img src="${e.target.result}" alt="미리보기">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    }

    renderMembers() {
        const membersList = document.getElementById('membersList');
        membersList.innerHTML = '';

        this.members.forEach(member => {
            const memberCard = document.createElement('div');
            memberCard.className = 'member-card';
            memberCard.innerHTML = `
                <div class="member-color" style="background-color: ${member.color}"></div>
                <h3>${member.nickname}</h3>
                <p>가입일: ${new Date(member.createdAt).toLocaleDateString()}</p>
            `;
            membersList.appendChild(memberCard);
        });
    }

    updateMemberSelect() {
        const memberSelect = document.getElementById('memberSelect');
        memberSelect.innerHTML = '<option value="">멤버를 선택하세요</option>';
        
        this.members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.textContent = member.nickname;
            memberSelect.appendChild(option);
        });
    }

    renderCalendar() {
        const currentMonth = document.getElementById('currentMonth');
        const calendarGrid = document.getElementById('calendarGrid');
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        currentMonth.textContent = `${year}년 ${month + 1}월`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        calendarGrid.innerHTML = '';
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            
            if (date.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            dayElement.textContent = date.getDate();
            
            // 해당 날짜의 운동 확인
            const dayWorkouts = this.workouts.filter(w => w.date === date.toISOString().split('T')[0]);
            if (dayWorkouts.length > 0) {
                dayElement.classList.add('has-workout');
                dayElement.style.cursor = 'pointer';
                
                // 멤버별 색상 표시
                dayWorkouts.forEach(workout => {
                    const member = this.members.find(m => m.id === workout.memberId);
                    if (member) {
                        const indicator = document.createElement('div');
                        indicator.className = 'workout-indicator';
                        indicator.style.backgroundColor = member.color;
                        dayElement.appendChild(indicator);
                    }
                });
                
                dayElement.addEventListener('click', () => {
                    this.showWorkoutDetails(date);
                });
            }
            
            calendarGrid.appendChild(dayElement);
        }
    }

    showWorkoutDetails(date) {
        const dayWorkouts = this.workouts.filter(w => w.date === date.toISOString().split('T')[0]);
        if (dayWorkouts.length === 0) return;
        
        const workout = dayWorkouts[0]; // 첫 번째 운동 표시
        const member = this.members.find(m => m.id === workout.memberId);
        
        document.getElementById('modalTitle').textContent = `${member.nickname}의 운동`;
        document.getElementById('modalImage').src = workout.photo;
        document.getElementById('modalInfo').textContent = 
            `${date.toLocaleDateString()}에 등록된 운동입니다.`;
        
        document.getElementById('photoModal').style.display = 'block';
    }

    saveData() {
        localStorage.setItem('fitkyung-members', JSON.stringify(this.members));
        localStorage.setItem('fitkyung-workouts', JSON.stringify(this.workouts));
    }

    loadData() {
        const savedMembers = localStorage.getItem('fitkyung-members');
        const savedWorkouts = localStorage.getItem('fitkyung-workouts');
        
        if (savedMembers) {
            this.members = JSON.parse(savedMembers);
        }
        
        if (savedWorkouts) {
            this.workouts = JSON.parse(savedWorkouts);
        }
    }
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', () => {
    new FitKyungApp();
});