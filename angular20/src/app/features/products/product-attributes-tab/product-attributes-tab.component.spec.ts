import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductAttributesTabComponent } from './product-attributes-tab.component';

describe('ProductAttributesTabComponent', () => {
  let component: ProductAttributesTabComponent;
  let fixture: ComponentFixture<ProductAttributesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductAttributesTabComponent, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductAttributesTabComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize empty attribute groups when no product', () => {
    fixture.detectChanges();
    expect(component.attributeGroups).toEqual([]);
  });

  it('should group attributes by category', () => {
    component.product = {
      attributes: [],
      sellFamily: {
        options: [
          {
            _id: '1',
            mode: 'text',
            group: { langs: [{ name: 'General' }] },
            langs: [{ name: 'Color' }],
            sequence: 1
          },
          {
            _id: '2',
            mode: 'number',
            group: { langs: [{ name: 'General' }] },
            langs: [{ name: 'Size' }],
            sequence: 2
          },
          {
            _id: '3',
            mode: 'text',
            group: { langs: [{ name: 'Details' }] },
            langs: [{ name: 'Material' }],
            sequence: 1
          }
        ]
      }
    };

    fixture.detectChanges();

    expect(component.attributeGroups.length).toBe(2);
    expect(component.attributeGroups[0].name).toBe('General');
    expect(component.attributeGroups[0].attributes.length).toBe(2);
    expect(component.attributeGroups[1].name).toBe('Details');
    expect(component.attributeGroups[1].attributes.length).toBe(1);
  });

  it('should sort attributes by sequence within group', () => {
    component.product = {
      attributes: [],
      sellFamily: {
        options: [
          {
            _id: '1',
            mode: 'text',
            group: { langs: [{ name: 'General' }] },
            langs: [{ name: 'Color' }],
            sequence: 3
          },
          {
            _id: '2',
            mode: 'number',
            group: { langs: [{ name: 'General' }] },
            langs: [{ name: 'Size' }],
            sequence: 1
          },
          {
            _id: '3',
            mode: 'text',
            group: { langs: [{ name: 'General' }] },
            langs: [{ name: 'Weight' }],
            sequence: 2
          }
        ]
      }
    };

    fixture.detectChanges();

    const generalGroup = component.attributeGroups.find(g => g.name === 'General');
    expect(generalGroup?.attributes[0].sequence).toBe(1);
    expect(generalGroup?.attributes[1].sequence).toBe(2);
    expect(generalGroup?.attributes[2].sequence).toBe(3);
  });

  it('should initialize missing attributes with default values', () => {
    component.product = {
      attributes: [],
      sellFamily: {
        options: [
          {
            _id: '1',
            mode: 'text',
            group: { langs: [{ name: 'General' }] },
            langs: [{ name: 'Color' }],
            sequence: 1
          },
          {
            _id: '2',
            mode: 'checkbox',
            group: { langs: [{ name: 'General' }] },
            langs: [{ name: 'Active' }],
            sequence: 2
          }
        ]
      }
    };

    fixture.detectChanges();

    expect(component.product.attributes.length).toBe(2);
    expect(component.product.attributes[0].attribute).toBe('1');
    expect(component.product.attributes[0].value).toBe('');
    expect(component.product.attributes[1].attribute).toBe('2');
    expect(component.product.attributes[1].value).toBe(false);
  });

  it('should emit save event on attribute change', () => {
    const saveSpy = jest.fn();
    component.save.subscribe(saveSpy);
    component.product = {
      attributes: [{ attribute: '1', value: 'test', options: [] }],
      sellFamily: { options: [] }
    };

    component.onAttributeChange();

    expect(saveSpy).toHaveBeenCalled();
  });

  it('should get and set attribute values correctly', () => {
    component.product = {
      attributes: [
        { attribute: '1', value: 'red', options: [] },
        { attribute: '2', value: 10, options: [] }
      ],
      sellFamily: { options: [] }
    };
    component.attributeMap = { '1': 0, '2': 1 };

    expect(component.getAttributeValue('1')).toBe('red');
    expect(component.getAttributeValue('2')).toBe(10);

    component.setAttributeValue('1', 'blue');
    expect(component.product.attributes[0].value).toBe('blue');
  });

  it('should handle file selection', () => {
    component.product = {
      attributes: [{ attribute: '1', value: '', options: [] }],
      sellFamily: { options: [] }
    };
    component.attributeMap = { '1': 0 };

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    } as any;

    component.onFileSelected(mockEvent, '1');

    expect(component.product.attributes[0].value).toBe('test.jpg');
  });

  it('should generate correct image URL', () => {
    const url = component.getImageUrl('abc123.jpg');
    expect(url).toBe('/erp/api/images/bank/s/abc123.jpg');
  });
});
