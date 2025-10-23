#!/bin/bash
# Start Angular 20 Dev Server
# Access at: http://localhost:4200
# Press Ctrl+C to stop

cd /workspace/project-angular-migration/angular20
ng serve --host 0.0.0.0 --proxy-config proxy.conf.json --poll=2000