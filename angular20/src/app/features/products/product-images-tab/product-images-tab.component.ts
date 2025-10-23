// Evidence: /angularjs2/app/views/product/images.html (lines 15-78)
// API: /erp/api/images/bank, /erp/api/product/:id/images
import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductService } from '../services/product.service';
import { ImagePreviewDialogComponent } from './image-preview-dialog.component';

interface ImageBank {
  _id: string;
  imageSrc: string;
  langs: Array<{ name: string; description?: string }>;
  size: { width: number; height: number };
  length: number;
}

interface ImageBankResponse {
  data: ImageBank[];
  total: number;
}

interface UploadQueueItem {
  file: File;
  uploading: boolean;
}

@Component({
  selector: 'app-product-images-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatListModule,
    MatTooltipModule
  ],
  templateUrl: './product-images-tab.component.html',
  styleUrl: './product-images-tab.component.scss'
})
export class ProductImagesTabComponent implements OnInit {
  @Input() productId: string = '';
  @Input() productImages: string[] = [];

  images = signal<ImageBank[]>([]);
  loading = signal(false);
  uploading = signal(false);
  searchQuery = '';
  totalImages = 0;
  pageSize = 12;
  pageIndex = 0;

  // Upload queue - Evidence: gridfs/file.html:51-76
  uploadQueue: UploadQueueItem[] = [];
  isDragging = false;

  private searchSubject = new Subject<string>();

  constructor(
    private productService: ProductService,
    private dialog: MatDialog
  ) {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(query => this.loadImages());
  }

  ngOnInit(): void {
    this.loadImages();
  }

  onSearchChange(): void {
    this.pageIndex = 0;
    this.searchSubject.next(this.searchQuery);
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadImages();
  }

  loadImages(): void {
    this.loading.set(true);
    const page = this.pageIndex + 1;
    
    this.productService
      .getImageBank(page, this.pageSize, this.searchQuery)
      .subscribe({
        next: (response: ImageBankResponse) => {
          this.images.set(response.data);
          this.totalImages = response.total;
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  isImageAdded(imageId: string): boolean {
    return this.productImages.indexOf(imageId) >= 0;
  }

  addImageToProduct(image: ImageBank): void {
    if (!this.productId) {
      console.error('Cannot add image: product ID is missing');
      return;
    }
    
    this.loading.set(true);
    this.productService
      .addImageToProduct(this.productId, image._id)
      .subscribe({
        next: () => {
          this.productImages.push(image._id);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to add image:', err);
          this.loading.set(false);
          alert('Failed to add image. Please try again.');
        }
      });
  }

  removeImageFromProduct(image: ImageBank): void {
    if (!this.productId) {
      console.error('Cannot remove image: product ID is missing');
      return;
    }
    
    this.loading.set(true);
    this.productService
      .removeImageFromProduct(this.productId, image._id)
      .subscribe({
        next: () => {
          const index = this.productImages.indexOf(image._id);
          if (index >= 0) {
            this.productImages.splice(index, 1);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Failed to remove image:', err);
          this.loading.set(false);
          alert('Failed to remove image. Please try again.');
        }
      });
  }

  openImagePreview(image: ImageBank): void {
    this.dialog.open(ImagePreviewDialogComponent, {
      data: image,
      width: '80vw',
      maxWidth: '1200px'
    });
  }

  getImageUrl(imageSrc: string, size: 'm' | 'l' = 'm'): string {
    return `/erp/api/images/bank/${size}/${imageSrc}`;
  }

  formatFileSize(sizeInMB: number): string {
    return sizeInMB < 1 
      ? `${(sizeInMB * 1024).toFixed(0)} KB` 
      : `${sizeInMB.toFixed(2)} MB`;
  }

  // File upload methods - Evidence: gridfs/file.html:1-27
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFilesToQueue(Array.from(input.files));
      input.value = ''; // Reset input
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files) {
      const imageFiles = Array.from(event.dataTransfer.files).filter(file =>
        file.type.startsWith('image/')
      );
      this.addFilesToQueue(imageFiles);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  private addFilesToQueue(files: File[]): void {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    imageFiles.forEach(file => {
      this.uploadQueue.push({ file, uploading: false });
    });
  }

  removeFromQueue(index: number): void {
    this.uploadQueue.splice(index, 1);
  }

  clearQueue(): void {
    this.uploadQueue = [];
  }

  uploadAll(): void {
    if (!this.productId || this.uploadQueue.length === 0) return;

    this.uploading.set(true);
    const uploadPromises = this.uploadQueue.map((item, index) =>
      this.uploadSingleFile(item, index)
    );

    Promise.all(uploadPromises).then(() => {
      this.uploading.set(false);
      this.uploadQueue = [];
      this.loadImages(); // Refresh image bank
      alert(`Successfully uploaded ${uploadPromises.length} image(s) to the image bank!`);
    }).catch((error) => {
      this.uploading.set(false);
      const errorMsg = error.status === 401 
        ? 'Authentication required. Please log in first.'
        : error.status === 500
        ? 'Server error. The image upload endpoint may require authentication or have configuration issues.'
        : `Upload failed: ${error.message || 'Unknown error'}`;
      console.error('Upload failed:', error);
      alert(errorMsg);
    });
  }

  private uploadSingleFile(item: UploadQueueItem, index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      item.uploading = true;
      
      const formData = new FormData();
      // Evidence: AngularJS FileUploader sends file with 'file' field name by default
      formData.append('file', item.file, item.file.name);

      this.productService.uploadImage(formData).subscribe({
        next: (response: any) => {
          item.uploading = false;
          // Add uploaded image ID to product images if available
          if (response && response._id) {
            this.productImages.push(response._id);
          }
          console.log('Upload successful:', response);
          resolve();
        },
        error: (err) => {
          item.uploading = false;
          console.error(`Failed to upload ${item.file.name}:`, err);
          console.error('Error details:', {
            status: err.status,
            message: err.message,
            error: err.error
          });
          reject(err);
        }
      });
    });
  }
}
