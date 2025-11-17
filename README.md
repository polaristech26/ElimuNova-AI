# ElimuNova AI - Intelligent Education Platform

Transform education with AI-powered lesson plans, schemes of work, and personalized learning experiences.

## 🚀 Features

### User Roles & Relationships
- **Super Admin**: Manages school admins, billing, packages, and curriculum uploads
- **School Admin**: Enrolls and manages teachers, handles school billing
- **Teachers**: Generate schemes of work and lesson plans with AI, manage students, create assignments
- **Students**: View lesson plans, complete assignments, track progress

### AI Features
- **AI Lesson Plans**: Generate comprehensive, curriculum-aligned lesson plans
- **Schemes of Work**: Create detailed schemes that align with educational standards
- **AI Assignments**: Generate various types of assignments with AI assistance
- **Alexa AI Assistant**: Built-in AI chatbot for teachers to get instant support
- **AI Teaching Materials**: Include text, images, and diagrams in teaching content

### Additional Features
- **Role-based Access Control**: Secure access based on user roles
- **File Storage**: Secure storage for documents and student work
- **Progress Tracking**: Monitor student progress and performance
- **Billing System**: Package-based subscriptions for schools
- **Responsive Design**: Modern, clean UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: TailwindCSS, Radix UI
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI/Anthropic (configurable)
- **File Storage**: UploadThing (configurable)

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd elimunova-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/elimunova_ai?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI API Keys (optional - for production)
OPENAI_API_KEY="your-openai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"

# File Storage (optional - for production)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Email (optional)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@elimunova.ai"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── teacher/           # Teacher dashboard and features
│   ├── student/           # Student dashboard and features
│   ├── school-admin/      # School admin dashboard
│   └── super-admin/       # Super admin dashboard
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
│   ├── auth.ts          # Authentication configuration
│   ├── prisma.ts        # Database client
│   ├── ai-service.ts    # AI service integration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
```

## 🔐 User Roles & Access

### Super Admin
- Access: `/super-admin/*`
- Features: Manage schools, packages, billing, system settings

### School Admin
- Access: `/school-admin/*`
- Features: Manage teachers and students, view billing, school settings

### Teacher
- Access: `/teacher/*`
- Features: Create lesson plans, schemes of work, manage students, use Alexa AI

### Student
- Access: `/student/*`
- Features: View lessons, complete assignments, track progress

## 🤖 AI Features

### Lesson Plan Generation
- AI-powered lesson plan creation
- Curriculum-aligned content
- Customizable objectives and activities
- Export to PDF/Word formats

### Scheme of Work Creation
- Comprehensive term planning
- Topic breakdown and sequencing
- Resource recommendations
- Assessment planning

### Alexa AI Assistant
- Instant teaching support
- Best practice recommendations
- Classroom management tips
- Assessment strategies

## 🗄️ Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: Core user information with role-based access
- **Schools**: School information and settings
- **Teachers/Students**: Role-specific user data
- **Lesson Plans**: AI-generated lesson content
- **Schemes of Work**: Term-based curriculum planning
- **Assignments**: Student assignments and submissions
- **Progress Tracking**: Student performance monitoring
- **Billing**: Package subscriptions and payments

## 🚀 Deployment

### Environment Variables
Ensure all required environment variables are set in your production environment.

### Database
Set up a PostgreSQL database and run migrations:
```bash
npx prisma migrate deploy
```

### Build and Deploy
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Updates

The platform is continuously updated with new features and improvements. Check the changelog for the latest updates.

---

**ElimuNova AI** - Transforming education with artificial intelligence.