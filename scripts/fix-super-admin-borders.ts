import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function fixBorders(content: string): string {
  let updatedContent = content

  // Fix double border-0 classes
  updatedContent = updatedContent
    .replace(/border-0-0/g, 'border-0')
    .replace(/border-0\s+border-0/g, 'border-0')
    
    // Fix spacing issues with border-0
    .replace(/\s+border-0edugenius/g, ' border-0 edugenius')
    .replace(/className="\s*border-0/g, 'className="border-0')
    
    // Ensure proper spacing in className
    .replace(/className="([^"]*?)\s+border-0\s+([^"]*?)"/g, 'className="$1 border-0 $2"')
    .replace(/className="([^"]*?)border-0([^"]*?)"/g, (match, before, after) => {
      const beforeTrimmed = before.trim()
      const afterTrimmed = after.trim()
      const parts = []
      if (beforeTrimmed) parts.push(beforeTrimmed)
      parts.push('border-0')
      if (afterTrimmed) parts.push(afterTrimmed)
      return `className="${parts.join(' ')}"`
    })

  return updatedContent
}

function processFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const updatedContent = fixBorders(content)
    
    if (content !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Fixed: ${filePath}`)
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
  console.log('🔧 Fixing border classes in Super Admin pages...\n')
  
  const superAdminDir = 'src/app/super-admin'
  const filesUpdated = processDirectory(superAdminDir)
  
  console.log(`\n✨ Complete! Fixed ${filesUpdated} files.`)
  console.log('🎯 All border classes have been properly formatted.')
}

main()