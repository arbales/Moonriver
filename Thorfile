require 'json'

class Moon < Thor
  desc "build", "build Application"
  def build                        
    @info ||= appinfo() 
    print <<-EOF
    
*************************** 
Building: #{@info['title']}"
Version: #{@info['version']}"
***************************     
    EOF
     
    invoke :clean                  
    invoke :compile_coffeescripts                       
    invoke :copy_files    
    invoke :package
    puts "\nBuild Complete."
  end  
  
  desc 'copy_files', 'copies files to build directory'    
  def copy_files
    puts "Copying files..."
    `mkdir -p build/source`
    `cp -R framework build/framework`
    `cp -R css build/css`
    `cp source/*.js build/source/`
    `cp *.json build/`
    `cp -R images build/`
    `cp *.js build/`
    `cp *.html build/`
  end
  
  desc 'compile_coffeescripts', 'compile CoffeeScript files to plain JS'
  def compile_coffeescripts
    puts "Compiling CoffeeScript sources..."
    `coffee -c .`
    `coffee -c source`
  end            
  
  desc 'clean', 'clean the `build` directory'
  def clean  
    @info ||= appinfo() 
    puts "Cleaning `build` directory..."    
    if File.exists? "#{@info['id']}_#{@info['version']}_all.ipk"  
      File.delete "#{@info['id']}_#{@info['version']}_all.ipk"  
    end                                   
    `rm -r build`
  end
  
  desc "package", "package a Palm application source directory to an IPK file."
  def package
    puts "Running `palm-package`"
    `palm-package build`
  end                
     
  desc "build_install", " build and install to Palm device."
  def build_install
    invoke :build
    invoke :install
  end

  desc "install", "install to Palm device."
  def install 
    @info ||= appinfo() 
    puts "Installing #{@info['title']} v#{@info['version']}..."
    `palm-install #{@info['id']}_#{@info['version']}_all.ipk`
  end
  
  desc "appinfo", "returns contents of appinfo.json"
  def appinfo
    data = ''
    f = File.open('appinfo.json', "r") 
    f.each_line do |line|
      data += line
    end
    JSON.parse data
  end
end