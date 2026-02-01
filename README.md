# 🎓 OmniSkill

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-Live_API-4285F4?style=for-the-badge&logo=google&logoColor=white)

**A comprehensive full-stack learning platform with AI-powered quizzes, real-time mock interviews, and coding practice**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation)

</div>

---

## 🌟 Features

### 📝 AI-Powered Quiz Generation
- **Concurrent Batch Processing**: Generates quiz questions in parallel using `CompletableFuture` for optimal performance
- **Custom Quiz Creation**: Create and share quizzes with unique referral codes
- **Dynamic Question Types**: Support for code snippets, multiple-choice, and explanations
- **Smart Answer Mapping**: Automatic conversion between letter answers (a, b, c, d) and index format

### 🎤 Real-Time AI Mock Interviews
- **Voice-Based Interaction**: Bidirectional audio streaming with Google Gemini 2.5 Flash Live API
- **16kHz PCM Audio Processing**: Custom React hooks for high-quality audio capture and playback
- **Real-Time Visualization**: Canvas-based waveform and frequency bar visualization
- **Transcript Persistence**: Automatic saving of interview transcripts with speaker attribution
- **Configurable Sessions**: Set role, experience level, and job description for tailored interviews

### 💻 Coding Problems Platform
- **Paginated Problem List**: Efficient loading of large problem sets with Spring Data `Pageable`
- **Advanced Search & Filtering**: Multi-field search across title and tags
- **Dynamic Sorting**: Sort by difficulty level using custom JPQL `CASE WHEN` expressions
- **LeetCode-Style Interface**: Problems with examples, constraints, and test cases

### 🔐 Enterprise-Grade Security
- **JWT Authentication**: Stateless session management with secure token handling
- **BCrypt Password Hashing**: Industry-standard password encryption
- **Role-Based Access Control**: Spring Security filter chains with protected routes
- **CORS Configuration**: Secure cross-origin resource sharing

### 🚀 DevOps & CI/CD
- **Automated Testing**: GitHub Actions pipeline with containerized PostgreSQL
- **Build Optimization**: Maven dependency caching and npm caching for faster builds
- **Dual-Service Pipeline**: Parallel backend and frontend build jobs

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | Type-safe UI components |
| Vite | Fast development and optimized builds |
| Framer Motion | Smooth animations and transitions |
| TailwindCSS | Utility-first styling |
| WebAudio API | Real-time audio capture and processing |
| Canvas API | Audio waveform visualization |
| Axios | HTTP client with interceptors |

### Backend
| Technology | Purpose |
|------------|---------|
| Spring Boot 3 | REST API framework |
| Spring Security | Authentication & authorization |
| Spring Data JPA | Database ORM with PostgreSQL |
| Spring AI | AI model integration |
| Lombok | Boilerplate reduction |
| Jackson | JSON serialization |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| PostgreSQL 15 | Primary database |
| GitHub Actions | CI/CD pipeline |
| Docker | Containerized test database |

---

## 🏗 Architecture

### Project Structure
```
OmniSkill/
├── backend-quiz/
│   └── Backend/
│       └── src/main/java/org/omniquiz/
│           ├── codingproblems/     # Coding problems module
│           │   ├── controller/
│           │   ├── model/
│           │   ├── repository/
│           │   └── service/
│           ├── config/             # Security & app configuration
│           │   ├── SecurityConfig.java
│           │   ├── JwtService.java
│           │   └── JwtAuthenticationFilter.java
│           ├── generate/           # AI quiz generation
│           │   ├── controller/
│           │   └── service/
│           ├── interview/          # Mock interview module
│           │   ├── controller/
│           │   ├── model/
│           │   ├── repository/
│           │   └── service/
│           ├── quiz/               # Quiz management
│           │   ├── dto/
│           │   ├── model/
│           │   └── repository/
│           └── user/               # User management
│               ├── controller/
│               ├── dto/
│               ├── model/
│               ├── repository/
│               └── service/
│
├── frontend-quiz/
│   └── src/
│       ├── apis/                   # API client functions
│       ├── components/
│       │   ├── pages/              # Route components
│       │   ├── AudioVisualizer.tsx
│       │   ├── Layout.tsx
│       │   └── Navbar.tsx
│       ├── contexts/               # React contexts
│       ├── hooks/                  # Custom React hooks
│       │   ├── useAudioCapture.ts
│       │   ├── useAudioPlayback.ts
│       │   └── useGeminiLive.ts
│       └── types/                  # TypeScript definitions
│
└── .github/workflows/
    └── ci-cd.yml                   # GitHub Actions pipeline
```

### Key Design Patterns

#### 1. Concurrent Quiz Generation
```java
// Parallel batch processing with CompletableFuture
List<CompletableFuture<List<GeneratedQuizQuestionsDTO>>> futures = new ArrayList<>();
for (int i = 0; i < totalBatches; i++) {
    futures.add(CompletableFuture.supplyAsync(() -> generateContent(batchPrompt)));
}

List<GeneratedQuizQuestionsDTO> allGenerated = futures.stream()
    .map(CompletableFuture::join)
    .flatMap(List::stream)
    .collect(Collectors.toList());
```

#### 2. JPA Lifecycle Hooks for JSON Serialization
```java
@Entity
public class Interview {
    @Column(columnDefinition = "TEXT")
    private String transcriptJson;
    
    @Transient
    private List<TranscriptEntry> transcript;

    @PrePersist
    @PreUpdate
    public void serializeTranscript() {
        this.transcriptJson = objectMapper.writeValueAsString(transcript);
    }

    @PostLoad
    public void deserializeTranscript() {
        this.transcript = objectMapper.readValue(transcriptJson, ...);
    }
}
```

#### 3. Dynamic JPQL with Conditional Sorting
```java
@Query("SELECT p FROM Problem p WHERE " +
    "(:search IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
    "ORDER BY " +
    "CASE WHEN :sortBy = 'difficulty_asc' THEN " +
    "  (CASE p.difficultyLevel WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 END) " +
    "END ASC")
Page<Problem> searchProblems(..., Pageable pageable);
```

#### 4. Real-Time Audio Processing Hook
```typescript
// 16-bit PCM audio capture with downsampling
export function useAudioCapture(onAudioData?: (data: Int16Array) => void) {
    const floatTo16BitPCM = (float32Array: Float32Array): Int16Array => {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        return int16Array;
    };
    // ...
}
```

---

## 🚀 Getting Started

### Prerequisites
- **Java 21** (or higher)
- **Node.js 20** (or higher)
- **PostgreSQL 15** (or higher)
- **Maven 3.8+**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yadati-Viswas/OmniSkill.git
   cd OmniSkill/backend-quiz/Backend
   ```

2. **Configure database**
   
   Create a PostgreSQL database and update `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/omniskill
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

3. **Set up API keys**
   ```properties
   spring.ai.openai.api-key=your_openrouter_api_key
   security.jwt.secret-key=your_jwt_secret_key
   ```

4. **Run the backend**
   ```bash
   mvn spring-boot:run
   ```
   
   The API will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd OmniSkill/frontend-quiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Create a `.env` file:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

---

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/v1-api/auth/users/signup` | Register new user |
| POST | `/v1-api/auth/users/login` | Login and get JWT |

### Quiz Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1-api/quiz/generate-questions` | Generate AI quiz | ✅ |
| POST | `/v1-api/quiz/create` | Create custom quiz | ✅ |
| GET | `/v1-api/quiz/join/:referral` | Join quiz by code | ✅ |

### Problems Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/v1-api/problems` | List problems (paginated) | ❌ |
| GET | `/v1-api/problems/:id` | Get problem by ID | ❌ |

**Query Parameters for `/v1-api/problems`:**
- `page` - Page number (0-indexed)
- `size` - Items per page
- `search` - Search in title/tags
- `tag` - Filter by tag
- `sortBy` - `difficulty_asc` or `difficulty_desc`

### Interview Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/v1-api/interviews` | Save interview session | ✅ |
| GET | `/v1-api/interviews` | Get user's interviews | ✅ |
| GET | `/v1-api/interviews/:id` | Get interview by ID | ✅ |

---

## 🧪 Testing

### Run Backend Tests
```bash
cd backend-quiz/Backend
mvn test
```

### Run Frontend Build
```bash
cd frontend-quiz
npm run build
```

### CI/CD Pipeline
The GitHub Actions pipeline automatically:
1. Spins up a PostgreSQL container
2. Runs Maven build and tests
3. Builds the Vite frontend
4. Caches dependencies for faster subsequent runs

---

## 📊 Database Schema

```sql
-- Users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone VARCHAR(20)
);

-- Quizzes
CREATE TABLE quiz (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,  -- CREATED or GENERATED
    topic VARCHAR(255),
    referral VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    user_fk BIGINT REFERENCES users(id)
);

-- Quiz Questions
CREATE TABLE quiz_question (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    code TEXT,
    options TEXT,  -- JSON array
    correct_index INTEGER,
    explanation TEXT,
    quiz_id BIGINT REFERENCES quiz(id),
    user_fk BIGINT REFERENCES users(id)
);

-- Coding Problems
CREATE TABLE problems (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    difficulty_level VARCHAR(50) NOT NULL,
    examples TEXT,
    constraints TEXT,
    test_cases TEXT,
    tags VARCHAR(255),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Interviews
CREATE TABLE interviews (
    id VARCHAR(255) PRIMARY KEY,
    config_role VARCHAR(255),
    config_job_description TEXT,
    config_experience_level VARCHAR(50),
    transcript_json TEXT,
    start_time BIGINT NOT NULL,
    end_time BIGINT,
    user_id BIGINT
);
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Yadati Viswas**

[![GitHub](https://img.shields.io/badge/GitHub-Yadati--Viswas-181717?style=flat-square&logo=github)](https://github.com/Yadati-Viswas)

---

<div align="center">

**⭐ Star this repo if you found it helpful!**

</div>
