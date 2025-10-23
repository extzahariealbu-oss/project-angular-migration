// Evidence: /angularjs2/app/views/product/images.html (lines 345-349)
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface ImageBank {
  _id: string;
  imageSrc: string;
  langs: Array<{ name: string; description?: string }>;
  size: { width: number; height: number };
  length: number;
}

@Component({
  selector: 'app-image-preview-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="image-preview-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>{{ data.langs[0]?.name || 'Image Preview' }}</h2>
        <button mat-icon-button mat-dialog-close>
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-dialog-content>
        <div class="image-wrapper">
          <img
            [src]="getImageUrl(data.imageSrc)"
            [alt]="data.langs[0]?.name || 'Preview'"
            class="preview-image"
          />
        </div>
        
        <div class="image-info">
          <p><strong>Filename:</strong> {{ data.imageSrc }}</p>
          <p><strong>Dimensions:</strong> {{ data.size.width }} × {{ data.size.height }} px</p>
          <p><strong>Size:</strong> {{ formatFileSize(data.length) }}</p>
          <p *ngIf="data.langs[0]?.description">
            <strong>Description:</strong> {{ data.langs[0].description }}
          </p>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .image-preview-dialog {
      .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 24px;
        border-bottom: 1px solid #e0e0e0;

        h2 {
          margin: 0;
          font-size: 20px;
        }
      }

      mat-dialog-content {
        padding: 24px;
        max-width: 100%;

        .image-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 24px;
          background: #f5f5f5;
          border-radius: 8px;
          overflow: hidden;

          .preview-image {
            max-width: 100%;
            max-height: 70vh;
            display: block;
          }
        }

        .image-info {
          p {
            margin: 8px 0;
            font-size: 14px;
            color: #666;

            strong {
              color: #333;
              margin-right: 8px;
            }
          }
        }
      }
    }
  `]
})
export class ImagePreviewDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: ImageBank) {}

  getImageUrl(imageSrc: string): string {
    return `/erp/api/images/bank/l/${imageSrc}`;
  }

  formatFileSize(sizeInMB: number): string {
    return sizeInMB < 1
      ? `${(sizeInMB * 1024).toFixed(0)} KB`
      : `${sizeInMB.toFixed(2)} MB`;
  }
}
