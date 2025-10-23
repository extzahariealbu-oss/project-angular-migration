/**
 * Shell Component (Main Layout)
 * Evidence: /angularjs2/themes/tm/views/layout.html
 * 
 * Header, conditional sidebar, content area, footer
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MatSidenavModule, HeaderComponent, SidebarComponent],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {
  constructor(public authService: AuthService) {}

  get showSidebar(): boolean {
    return this.authService.currentUser()?.right_menu ?? false;
  }
}
