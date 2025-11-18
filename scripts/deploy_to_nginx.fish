#!/usr/bin/env fish

# deploy_to_nginx.fish
# Usage: ./deploy_to_nginx.fish [--local-target PATH] [--remote user@host] [--remote-path PATH]
#        [--conf-name NAME] [--server-name SERVER] [--force] [--help]

function show_help
    echo "Usage: deploy_to_nginx.fish [options]"
    echo "Options:" \
         "  --local-target PATH    Install files locally to PATH (default: /var/www/<project>)" \
         "  --remote user@host     Copy files to remote host and install there" \
         "  --remote-path PATH     Remote target path (default: /var/www/<project>)" \
         "  --conf-name NAME       Nginx config name (default: <project>)" \
         "  --server-name NAME     server_name value for nginx (default: localhost)" \
         "  --force                Overwrite existing files without prompt" \
         "  -h, --help             Show this help message"
end

# Defaults
set -l project_name (basename (pwd))
set -l dist_dir dist
set -l target "/var/www/$project_name"
set -l conf_name $project_name.conf
set -l server_name localhost
set -l remote_host ""
set -l remote_path ""
set -l force 0

# Parse args
set -l i 1
while test $i -le (count $argv)
    set -l arg $argv[$i]
    switch $arg
        case --local-target
            set i (math $i + 1)
            set target $argv[$i]
        case --remote
            set i (math $i + 1)
            set remote_host $argv[$i]
        case --remote-path
            set i (math $i + 1)
            set remote_path $argv[$i]
        case --conf-name
            set i (math $i + 1)
            set conf_name $argv[$i]
        case --server-name
            set i (math $i + 1)
            set server_name $argv[$i]
        case --force
            set force 1
        case -h --help
            show_help
            exit 0
        case '*'
            echo "Unknown option: $arg"
            show_help
            exit 1
    end
    set i (math $i + 1)
end

if not test -d $dist_dir
    echo "Error: '$dist_dir' directory not found. Run your build first."; exit 1
end

function write_nginx_conf --argument conf_path
    set -l conf_path $argv[1]
    set -l tmpl "$(cat (pwd)/scripts/nginx_template.conf)"
    set -l contents (string replace "{{SERVER_NAME}}" "$server_name" $tmpl)
    set -l contents (string replace "{{ROOT}}" "$target" $contents)
    echo $contents | sudo tee $conf_path > /dev/null
end

if test -n "$remote_host"
    # Remote deployment
    if test -z "$remote_path"
        set remote_path "/var/www/$project_name"
    end

    set -l tmp_remote "/tmp/$project_name-dist-"(date +%s)
    echo "Copying '$dist_dir' to $remote_host:$tmp_remote..."
    scp -r $dist_dir $remote_host:$tmp_remote || begin; echo "scp failed"; exit 2; end

    echo "Installing on remote host..."
    # Create target dir, sync and set permissions, write nginx conf, reload
    ssh $remote_host "sudo mkdir -p $remote_path && sudo rsync -a --delete $tmp_remote/ $remote_path/ && sudo chown -R www-data:www-data $remote_path || true"

    # Push nginx conf via ssh heredoc
    set -l remote_conf_path "/etc/nginx/sites-available/$conf_name"
    printf "%s" (cat (pwd)/scripts/nginx_template.conf) | ssh $remote_host "sudo tee $remote_conf_path > /dev/null"
    ssh $remote_host "sudo ln -sf $remote_conf_path /etc/nginx/sites-enabled/$conf_name; sudo nginx -t && sudo systemctl reload nginx"

    echo "Remote deploy to $remote_host:$remote_path complete."
    exit 0
end

# Local deployment
if test -d $target
    if test $force -eq 0
        echo "Target '$target' already exists. Use --force to overwrite." 
        read -P "Overwrite target? (y/N): " confirm
        if test "$confirm" != "y" -a "$confirm" != "Y"
            echo "Aborted by user."; exit 1
        end
    end
end

echo "Preparing local target: $target"
sudo mkdir -p $target

if type -q rsync
    echo "Syncing via rsync..."
    sudo rsync -a --delete $dist_dir/ $target/
else
    echo "rsync not found, using cp fallback..."
    sudo rm -rf $target/*
    sudo cp -r $dist_dir/* $target/
end

# Set ownership to www-data when possible
if id -u www-data >/dev/null 2>&1
    sudo chown -R www-data:www-data $target || true
end

# Write nginx config
set -l conf_path "/etc/nginx/sites-available/$conf_name"
write_nginx_conf $conf_path
sudo ln -sf $conf_path /etc/nginx/sites-enabled/$conf_name

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

echo "Local deploy complete. Site root: $target; nginx config: $conf_path"
exit 0
