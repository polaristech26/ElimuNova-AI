import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function removeDashboardBorders(content: string): string {
  let updatedContent = content

  // Remove borders from Card components and add border-0
  updatedContent = updatedContent
    // Add border-0 to Card components that don't have it
    .replace(/<Card\s+className="([^"]*?)(?<!border-0)([^"]*?)"/g, (match, before, after) => {
      if (before.includes('border-0') || after.includes('border-0')) {
        return match
      }
      // Don't add border-0 if it already has a specific border class that should be kept
      if (before.includes('border-purple-200') || after.includes('border-purple-200') ||
          before.includes('border-blue-200') || after.includes('border-blue-200') ||
          before.includes('border-green-200') || after.includes('border-green-200') ||
          before.includes('border-red-200') || after.includes('border-red-200')) {
        return match
      }
      return `<Card className="${before} border-0${after}"`
    })
    
    // Remove borders from notification/alert divs and replace with border-0
    .replace(/className="([^"]*?)border border-red-400([^"]*?)"/g, 'className="$1border-0$2"')
    .replace(/className="([^"]*?)border border-green-400([^"]*?)"/g, 'className="$1border-0$2"')
    .replace(/className="([^"]*?)border border-blue-400([^"]*?)"/g, 'className="$1border-0$2"')
    .replace(/className="([^"]*?)border border-yellow-400([^"]*?)"/g, 'className="$1border-0$2"')
    
    // Remove borders from form elements but keep focus rings
    .replace(/className="([^"]*?)border border-gray-200([^"]*?)"/g, 'className="$1border-0$2"')
    .replace(/className="([^"]*?)border border-gray-300([^"]*?)"/g, 'className="$1border-0$2"')
    
    // Remove table borders but keep border-none classes (they're intentional)
    .replace(/className="([^"]*?)border border-gray-300([^"]*?)"/g, 'className="$1border-0$2"')
    
    // Clean up multiple border-0 classes
    .replace(/border-0\s+border-0/g, 'border-0')

  return updatedContent
}

function processFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const updatedContent = removeDashboardBorders(content)
    
    if (content !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Updated: ${filePath}`)
      return true
    } else {
      console.log(`⏭️  No changes needed: ${filePath}`)
      return false
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error)
    return false
  }
}

function processDirectory(dirPath: string) {
  const items = readdirSync(dirPath)
  let filesUpdated = 0
  
  for (const item of items) {
    const fullPath = join(dirPath, item)
    const stat = statSync(fullPath)
    
    if (stat.isDirectory()) {
      filesUpdated += processDirectory(fullPath)
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      if (processFile(fullPath)) {
        filesUpdated++
      }
    }
  }
  
  return filesUpdated
}

function main() {
  console.log('🚀 Removing borders from all dashboard pages for consistency...\n')
  
  const dashboardDirs = [
    'src/app/school-admin',
    'src/app/teacher', 
    'src/app/student'
  ]
  
  let totalFilesUpdated = 0
  
  for (const dir of dashboardDirs) {
    console.log(`\n📁 Processing ${dir}...`)
    const filesUpdated = processDirectory(dir)
    totalFilesUpdated += filesUpdated
    console.log(`   Updated ${filesUpdated} files in ${dir}`)
  }
  
  console.log(`\n✨ Complete! Updated ${totalFilesUpdated} files across all dashboards.`)
  console.log('🎯 All dashboard pages now have consistent borderless design.')
}

main()