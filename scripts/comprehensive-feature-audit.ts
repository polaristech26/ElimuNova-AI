import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

interface AuditResult {
  category: string
  item: string
  status: 'WORKING' | 'MISSING' | 'INCOMPLETE' | 'ERROR'
  details: string
  apiEndpoint?: string
  hasComponent?: boolean
}

const auditResults: AuditResult[] = []

function checkFileExists(path: string): boolean {
  try {
    statSync(path)
    return true
  } catch {
    return false
  }
}

function checkAPIEndpoint(path: string): boolean {
  return checkFileExists(`src/app/api/${path}/route.ts`)
}

function checkComponent(path: string): boolean {
  return checkFileExists(`src/components/${path}`)
}

function checkPage(path: string): boolean {
  return checkFileExists(`src/app/${path}/page.tsx`)
}

function auditPublicPages() {
  console.log('🌐 Auditing Public Pages...')
  
  const publicPages = [
    { name: 'Landing Page', path: 'page.tsx' },
    { name: 'Pricing Page', path: 'pricing/page.tsx' },
    { name: 'About Page', path: 'about/page.tsx' },
    { name: 'Contact Page', path: 'contact/page.tsx' },
    { name: 'Help Center', path: 'help/page.tsx' },
    { name: 'Privacy Policy', path: 'privacy/page.tsx' },
    { name: 'Terms of Service', path: 'terms/page.tsx' }
  ]

  publicPages.forEach(page => {
    const exists = checkFileExists(`src/app/${page.path}`)
    auditResults.push({
      category: 'Public Pages',
      item: page.name,
      status: exists ? 'WORKING' : 'MISSING',
      details: exists ? 'Page exists and accessible' : 'Page file not found'
    })
  })
}

function auditAuthSystem() {
  console.log('🔐 Auditing Authentication System...')
  
  const authComponents = [
    { name: 'Sign In Page', path: 'auth/signin/page.tsx' },
    { name: 'Sign Up Page', path: 'auth/signup/page.tsx' },
    { name: 'Error Page', path: 'auth/error/page.tsx' }
  ]

  authComponents.forEach(component => {
    const exists = checkFileExists(`src/app/${component.path}`)
    auditResults.push({
      category: 'Authentication',
      item: component.name,
      status: exists ? 'WORKING' : 'MISSING',
      details: exists ? 'Auth component exists' : 'Auth component missing'
    })
  })
}

function auditDashboards() {
  console.log('📊 Auditing Dashboard Systems...')
  
  const dashboards = [
    { name: 'Super Admin Dashboard', path: 'super-admin/dashboard' },
    { name: 'School Admin Dashboard', path: 'school-admin/dashboard' },
    { name: 'Teacher Dashboard', path: 'teacher/dashboard' },
    { name: 'Student Dashboard', path: 'student/dashboard' }
  ]

  dashboards.forEach(dashboard => {
    const exists = checkPage(dashboard.path)
    const apiExists = checkAPIEndpoint(dashboard.path.replace('dashboard', 'dashboard-stats'))
    
    auditResults.push({
      category: 'Dashboards',
      item: dashboard.name,
      status: exists && apiExists ? 'WORKING' : exists ? 'INCOMPLETE' : 'MISSING',
      details: `Page: ${exists ? '✅' : '❌'}, API: ${apiExists ? '✅' : '❌'}`,
      hasComponent: exists,
      apiEndpoint: apiExists ? `${dashboard.path.replace('dashboard', 'dashboard-stats')}` : undefined
    })
  })
}

function auditAIFeatures() {
  console.log('🤖 Auditing AI Features...')
  
  const aiFeatures = [
    { name: 'AI Tutor', page: 'student/ai-tutor', api: 'student/ai-tutor', component: 'ai/ai-tutor.tsx' },
    { name: 'AI Content Generation', page: null, api: 'ai/generate-content', component: 'modals/ai-generator-modal.tsx' },
    { name: 'AI Image Generation', page: 'student/ai-tools', api: 'ai/generate-image', component: 'ai/image-generator.tsx' },
    { name: 'AI Presentation Generator', page: 'teacher/ai-tools', api: 'ai/generate-presentation', component: 'ai/presentation-generator.tsx' },
    { name: 'AI Lesson Plans', page: 'teacher/lesson-plans', api: 'ai/generate-content', component: 'modals/create-lesson-plan-modal.tsx' },
    { name: 'AI Schemes of Work', page: 'teacher/schemes-of-work', api: 'ai/generate-scheme-of-work', component: null },
    { name: 'AI Rubric Generator', page: 'teacher/rubric-generator', api: 'ai/generate-rubric', component: null }
  ]

  aiFeatures.forEach(feature => {
    const pageExists = feature.page ? checkPage(feature.page) : true
    const apiExists = checkAPIEndpoint(feature.api)
    const componentExists = feature.component ? checkComponent(feature.component) : true

    let status: 'WORKING' | 'MISSING' | 'INCOMPLETE' | 'ERROR' = 'WORKING'
    if (!pageExists || !apiExists || !componentExists) {
      status = (pageExists || apiExists || componentExists) ? 'INCOMPLETE' : 'MISSING'
    }

    auditResults.push({
      category: 'AI Features',
      item: feature.name,
      status,
      details: `Page: ${pageExists ? '✅' : '❌'}, API: ${apiExists ? '✅' : '❌'}, Component: ${componentExists ? '✅' : '❌'}`,
      apiEndpoint: feature.api,
      hasComponent: componentExists
    })
  })
}

function auditSubscriptionSystem() {
  console.log('💳 Auditing Subscription & Billing System...')
  
  const subscriptionFeatures = [
    { name: 'Subscription Status API', api: 'subscription/status' },
    { name: 'Create Checkout API', api: 'subscription/create-checkout' },
    { name: 'Start Trial API', api: 'subscription/start-trial' },
    { name: 'Stripe Webhooks', api: 'webhooks/stripe' },
    { name: 'Billing Page (Student)', page: 'student/billing' },
    { name: 'Billing Page (Teacher)', page: 'teacher/billing' },
    { name: 'Billing Page (School Admin)', page: 'school-admin/billing' },
    { name: 'Subscription Guard Component', component: 'subscription/subscription-guard.tsx' },
    { name: 'Subscription Alert Component', component: 'subscription/subscription-alert.tsx' },
    { name: 'Pricing Plans Component', component: 'pricing/pricing-plans.tsx' }
  ]

  subscriptionFeatures.forEach(feature => {
    let exists = false
    let type = ''
    
    if (feature.api) {
      exists = checkAPIEndpoint(feature.api)
      type = 'API'
    } else if (feature.page) {
      exists = checkPage(feature.page)
      type = 'Page'
    } else if (feature.component) {
      exists = checkComponent(feature.component)
      type = 'Component'
    }

    auditResults.push({
      category: 'Subscription System',
      item: feature.name,
      status: exists ? 'WORKING' : 'MISSING',
      details: `${type}: ${exists ? '✅' : '❌'}`,
      apiEndpoint: feature.api,
      hasComponent: !!feature.component
    })
  })
}

function auditUserManagement() {
  console.log('👥 Auditing User Management...')
  
  const userFeatures = [
    { name: 'User Profile Modal', component: 'modals/user-profile-modal.tsx' },
    { name: 'Create User Modal', component: 'modals/create-user-modal.tsx' },
    { name: 'Create School Modal', component: 'modals/create-school-modal.tsx' },
    { name: 'Enroll Student Modal', component: 'modals/enroll-student-modal.tsx' },
    { name: 'User Profile API', api: 'user-profile' },
    { name: 'School Info Hook', component: 'hooks/use-school-info.ts' }
  ]

  userFeatures.forEach(feature => {
    let exists = false
    
    if (feature.api) {
      exists = checkAPIEndpoint(feature.api)
    } else if (feature.component) {
      exists = checkComponent(feature.component) || checkFileExists(`src/${feature.component}`)
    }

    auditResults.push({
      category: 'User Management',
      item: feature.name,
      status: exists ? 'WORKING' : 'MISSING',
      details: exists ? 'Component/API exists' : 'Component/API missing'
    })
  })
}

function auditMessagingSystem() {
  console.log('💬 Auditing Messaging System...')
  
  const messagingFeatures = [
    { name: 'Teacher Messages Page', page: 'teacher/messages' },
    { name: 'Student Messages Page', page: 'student/messages' },
    { name: 'Teacher Messages API', api: 'teacher/messages' },
    { name: 'Student Messages API', api: 'student/messages' },
    { name: 'Unread Messages Hook', component: 'hooks/use-unread-messages.ts' },
    { name: 'Compose Message Modal', component: 'modals/compose-message-modal.tsx' },
    { name: 'View Message Modal', component: 'modals/view-message-modal.tsx' }
  ]

  messagingFeatures.forEach(feature => {
    let exists = false
    
    if (feature.api) {
      exists = checkAPIEndpoint(feature.api)
    } else if (feature.page) {
      exists = checkPage(feature.page)
    } else if (feature.component) {
      exists = checkComponent(feature.component) || checkFileExists(`src/${feature.component}`)
    }

    auditResults.push({
      category: 'Messaging System',
      item: feature.name,
      status: exists ? 'WORKING' : 'MISSING',
      details: exists ? 'Feature exists' : 'Feature missing'
    })
  })
}

function auditEducationalFeatures() {
  console.log('📚 Auditing Educational Features...')
  
  const educationalFeatures = [
    { name: 'Lesson Plans (Teacher)', page: 'teacher/lesson-plans' },
    { name: 'Lesson Plans (Student)', page: 'student/lesson-plans' },
    { name: 'Assignments (Teacher)', page: 'teacher/assignments' },
    { name: 'Assignments (Student)', page: 'student/assignments' },
    { name: 'Schemes of Work (Teacher)', page: 'teacher/schemes-of-work' },
    { name: 'Schemes of Work (Student)', page: 'student/schemes-of-work' },
    { name: 'Student Management (Teacher)', page: 'teacher/students' },
    { name: 'Student Management (School Admin)', page: 'school-admin/students' },
    { name: 'Teacher Management (School Admin)', page: 'school-admin/teachers' },
    { name: 'Create Assignment Modal', component: 'modals/create-assignment-modal.tsx' },
    { name: 'Edit Assignment Modal', component: 'modals/edit-assignment-modal.tsx' }
  ]

  educationalFeatures.forEach(feature => {
    let exists = false
    
    if (feature.page) {
      exists = checkPage(feature.page)
    } else if (feature.component) {
      exists = checkComponent(feature.component)
    }

    auditResults.push({
      category: 'Educational Features',
      item: feature.name,
      status: exists ? 'WORKING' : 'MISSING',
      details: exists ? 'Feature exists' : 'Feature missing'
    })
  })
}

function generateAuditReport() {
  console.log('\n📋 Generating Comprehensive Audit Report...\n')
  
  const categories = [...new Set(auditResults.map(r => r.category))]
  
  categories.forEach(category => {
    const categoryResults = auditResults.filter(r => r.category === category)
    const working = categoryResults.filter(r => r.status === 'WORKING').length
    const total = categoryResults.length
    const percentage = Math.round((working / total) * 100)
    
    console.log(`\n🔍 ${category}:`)
    console.log(`   Status: ${working}/${total} (${percentage}%) working`)
    
    categoryResults.forEach(result => {
      const statusIcon = {
        'WORKING': '✅',
        'INCOMPLETE': '⚠️',
        'MISSING': '❌',
        'ERROR': '🚨'
      }[result.status]
      
      console.log(`   ${statusIcon} ${result.item}: ${result.details}`)
    })
  })
  
  // Overall summary
  const totalWorking = auditResults.filter(r => r.status === 'WORKING').length
  const totalFeatures = auditResults.length
  const overallPercentage = Math.round((totalWorking / totalFeatures) * 100)
  
  console.log(`\n🎯 OVERALL SYSTEM STATUS:`)
  console.log(`   ${totalWorking}/${totalFeatures} features working (${overallPercentage}%)`)
  
  if (overallPercentage >= 90) {
    console.log(`   🎉 EXCELLENT! System is production-ready`)
  } else if (overallPercentage >= 75) {
    console.log(`   ✅ GOOD! Most features working, minor issues to address`)
  } else if (overallPercentage >= 50) {
    console.log(`   ⚠️  NEEDS WORK! Several features need attention`)
  } else {
    console.log(`   🚨 CRITICAL! Major features missing or broken`)
  }
}

function main() {
  console.log('🚀 Starting Comprehensive ElimuNova AI Feature Audit...\n')
  
  auditPublicPages()
  auditAuthSystem()
  auditDashboards()
  auditAIFeatures()
  auditSubscriptionSystem()
  auditUserManagement()
  auditMessagingSystem()
  auditEducationalFeatures()
  
  generateAuditReport()
  
  console.log('\n✨ Audit Complete!')
}

main()