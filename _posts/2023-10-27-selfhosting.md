---
layout: post
title: How I Save $0 a Month Hosting Open Source Software in the Cloud
image: /public/selfhosting/setup.png
---
Hosting software yourself can help you:

1. Avoid vendor lock-in
2. Own your own data
3. Learn more about infrastructure and ops

# What do I host?
I embarked on my self-hosting journey years ago, but am starting to feel good about my current setup. I currently run the following, mostly accessible over the public internet:

* [Mealie](https://mealie.io/) - Recipe manager
* [Vaultwarden](https://github.com/dani-garcia/vaultwarden) - Password manager
* [NextCloud](https://nextcloud.com/) - Google Drive / Photos alternative
* [Tailscale](https://tailscale.com/) - VPN
* [FreshRSS](https://freshrss.org/index.html) - RSS feed aggregator
* [Wallabag](https://wallabag.org/) - Read-it-later app

I host all of this for $0 a month, and pay a nominal fee for backups, which is about what I would pay for a paid/commercial version of these things. But it's not about the money, it's about the principle!

# Where do I host it?
Broadly, there are 2 options for self-hosting:

1. **On-prem:** Run your own Raspberry Pi, old server you found, or a fancy Network Attached Storage device in your home
2. **Cloud:** Use some cloud provider like Google Cloud Platform or Amazon Web Services

Option 1 is great for full ownership of your data, and the lack of trust in any third parties. However, it might be less reliable. For instance, your public IP may not be stable, your power might go out, your dog might eat your homework.

Option 2 is great if you're lazy and don't trust yourself with running hardware. I've gone with option 2.

I believe the best-kept secret on the internet is Oracle Cloud Infrastructure (OCI)'s [Always Free](https://www.oracle.com/cloud/free/) Tier. I pay Oracle $0 a month and get the following specs on my Virtual Machine (VM):

* 24 GB memory
* 200 GB storage
* 4 virtual cores

![vm-specs](/public/selfhosting/oci-vm-shape.png)

This is a crazy good deal! I used to use DigitalOcean, and I love DO's simple interface. But $0/month is less than $6/month, and I'm kind of a cheapskate.

![setup](/public/selfhosting/setup.png)

# How do I host it?
## Containers - Docker
Most self-hosted applications are easy to setup using Docker and Docker Compose. For example, here's the Docker Compose file for FreshRSS, my RSS feed aggregator:

```yaml
version: "2.4"

services:

  freshrss:
    image: freshrss/freshrss:custom
    container_name: freshrss
    hostname: freshrss
    ports:
      - "8281:80"
    restart: unless-stopped
    logging:
      options:
        max-size: 10m
    volumes:
      - /blkstg/freshrss-data/:/var/www/FreshRSS/data
    environment:
      TZ: America/Denver
      CRON_MIN: '1,31'
```

It's pretty simple! Then I run `docker compose up`, and I've got the service running on port 8281 on my VM. Also, I've mapped the folder `/blkstg/freshrss-data` to the Docker container, so that any files created by FreshRSS show up on the host VM's filesystem at that path. This `/blkstg` path is an OCI Block Storage volume that I configured using the Oracle Cloud website. It has a 150 GB capacity.

## Reverse Proxy - Nginx
To expose this service to the outside world, I use Nginx as a reverse proxy. Nginx is configured for this service like this:

```nginx
server {
    server_name freshrss.<my_domain>.com;

    location / { 
        proxy_pass http://localhost:8281;
    }
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/<my_domain>.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<my_domain>.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = freshrss.<my_domain>.com) {
        return 301 https://$host$request_uri;
    }


    server_name freshrss.<my_domain>.com;
    listen 80;
    return 404;
}

server {
    server_name www.freshrss.<my_domain>.com;
    return 301 $scheme://freshrss.<my_domain>.com$request_uri;
}
```

## TLS - Certbot
The TLS keys are managed by `certbot` - I just have one key that is configured for `*.<my_domain>.com`, so that I can easily add a new service on a new subdomain and not need a new TLS certificate.

## DNS - Namecheap
DNS is managed by Namecheap, my domain provider. I've tried hosting DNS myself and it was too scary and too much of a pain. I use an A record to point to my OCI VM's IP address, and a `*` CNAME record to enable any subdomain of my domain to also point to the VM:

![namecheap-dns](/public/selfhosting/namecheap-dns.png)

## Backups - BackBlaze B2
Backups are critical! I've got a pretty killer backup script [here](https://github.com/samc1213/selfhosted/blob/master/files/backup-oci-bv.sh). It utilizes the OCI command line tool to create a point-in-time backup of my Block Volume, mount the backup to my VM, and uses rclone to copy all the data into BackBlaze B2. BackBlaze charges $6/month per TB, which is quite reasonable. I manually check BackBlaze occasionally, ensure new backups look good, and remove old ones to save space.

## Error Notifications - systemd and email
I have a simple systemd service to notify me of errors over email. You can check it out [here](https://github.com/samc1213/selfhosted/blob/master/files/error-notify%40.service.j2). Right now I just notify on errors with my backup process.

## Configuration/Automation/Management - Ansible
All of this gets to be a lot to manage! And while my OCI Block Storage Volume is backed up, the actual operating system volume is not backed up from my VM. So if it were to die, I'd lose all the Nginx configurations, Docker Compose files, etc. I recently started using [Ansible](https://www.ansible.com/) to manage all of this. Ansible runs on my personal laptop, and uses SSH to connect to my OCI VM. I love the Ansible Vault feature, which allows me to commit secrets to my Ansible [repo](https://github.com/samc1213/selfhosted/), and encrypts them. Then, when running an Ansible Playbook, I can provide a password to decrypt the secrets and drop them on my VM. Ansible allows me to see everything that I'm running on my self-hosted setup in one place.

# Conclusion
All in all, I love hosting my own software in the cloud. It helps me take control over my own data, and I learn a lot about operating cloud software. Of course this isn't the most sophisticated setup, but it allows me to learn some new tools (Oracle Cloud, Ansible), without being too overengineered or hard to manage. Given OCI's incredible Free Tier, you might as well give it a try!

# Shameless plug
Interested in hiring me? See my resume [here](https://samacohen.com/resume.pdf)
