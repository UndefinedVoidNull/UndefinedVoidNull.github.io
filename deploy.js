const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting build and deploy process...\n');

try {
    // Step 1: Run build
    console.log('📦 Building site...');
    execSync('node build.js', { stdio: 'inherit' });
    
    // Step 2: Check if git is initialized
    if (!fs.existsSync('.git')) {
        console.error('❌ Error: Git repository not initialized. Please run "git init" first.');
        process.exit(1);
    }
    
    // Step 3: Check git status
    console.log('\n📊 Checking git status...');
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    
    if (!status.trim()) {
        console.log('✅ No changes to commit. Everything is up to date!');
        process.exit(0);
    }
    
    // Step 4: Add all changes
    console.log('\n➕ Staging changes...');
    execSync('git add -A', { stdio: 'inherit' });
    
    // Step 5: Commit
    console.log('\n💾 Committing changes...');
    const commitMessage = `Update blog - ${new Date().toISOString().split('T')[0]}`;
    execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
    
    // Step 6: Push to GitHub
    console.log('\n🚀 Pushing to GitHub...');
    execSync('git push', { stdio: 'inherit' });
    
    console.log('\n✅ Deploy completed successfully!');
} catch (error) {
    console.error('\n❌ Error during deploy:', error.message);
    process.exit(1);
}
