import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function removeAllBorders(content: string): string {
  // Remove all border classes and add border-0 to Cards that don't have it
  let updatedContent = content

  // Replace border classes with border-0 or remove them
  updatedContent = updatedContent
    // Remove standalone border classes
    .replace(/\bborder\b(?!\-)/g, 'border-0')
    .replace(/\bborder-\w+/g, 'border-0')
    .replace(/\bborder-\d+/g, 'border-0')
    
    // Remove border from className strings but keep other classes
    .replace(/className="([^"]*)\bborder\b([^"]*)"/g, 'className="$1border-0$2"')
    .replace(/className="([^"]*)\bborder-\w+([^"]*)"/g, 'className="$1border-0$2"')
    .replace(/className="([^"]*)\bborder-\d+([^"]*)"/g, 'className="$1border-0$2"')
    
    // Clean up multiple border-0 classes
    .replace(/border-0\s+border-0/g, 'border-0')
    
    // Ensure Cards have border-0 if they don't already
    .replace(/<Card\s+className="([^"]*?)(?<!border-0)([^"]*?)"/g, (match, before, after) => {
      if (before.includes('border-0') || after.includes('border-0')) {
        return match
      }
      return `<Card className="${before} border-0${after}"`
    })

  return updatedContent
}

function processFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const updatedContent = removeAllBorders(content)
    
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
  console.log('🚀 Removing all borders from Super Admin pages...\n')
  
  const superAdminDir = 'src/app/super-admin'
  const filesUpdated = processDirectory(superAdminDir)
  
  console.log(`\n✨ Complete! Updated ${filesUpdated} files.`)
  console.log('🎯 All borders have been removed from Super Admin pages.')
}

main()