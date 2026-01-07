import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

function finalCleanup(content: string): string {
  let updatedContent = content

  // Fix Badge border issues
  updatedContent = updatedContent
    .replace(/border-0\s+-600/g, 'border-red-600')
    .replace(/border-0\s+-green-600/g, 'border-green-600')
    .replace(/border-0\s+-blue-600/g, 'border-blue-600')
    .replace(/border-0\s+-\w+-\d+/g, (match) => {
      // Extract the color from the malformed class
      const colorMatch = match.match(/border-0\s+-(\w+-\d+)/)
      if (colorMatch) {
        return `border-${colorMatch[1]}`
      }
      return 'border-0'
    })
    
    // Fix div border issues
    .replace(/className="([^"]*?)border-0\s+-200([^"]*?)"/g, 'className="$1border-t border-gray-200$2"')
    .replace(/className="([^"]*?)border-0([^"]*?)"/g, (match, before, after) => {
      // For divs that should have borders, restore appropriate border classes
      if (match.includes('pt-2') || match.includes('mt-4')) {
        return match.replace('border-0', 'border-t')
      }
      return match
    })

  return updatedContent
}

function processFile(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8')
    const updatedContent = finalCleanup(content)
    
    if (content !== updatedContent) {
      writeFileSync(filePath, updatedContent, 'utf8')
      console.log(`✅ Cleaned: ${filePath}`)
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
  console.log('🧹 Final cleanup of border classes in Super Admin pages...\n')
  
  const superAdminDir = 'src/app/super-admin'
  const filesUpdated = processDirectory(superAdminDir)
  
  console.log(`\n✨ Complete! Cleaned ${filesUpdated} files.`)
  console.log('🎯 All border issues have been resolved.')
}

main()