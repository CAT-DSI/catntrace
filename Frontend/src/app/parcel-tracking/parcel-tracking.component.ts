import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { OrderService } from '../../shared/Services/order.service';
import { HttpClientModule } from '@angular/common/http';
import { OrderModel } from '../../shared/Models/order.model';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HostListener } from '@angular/core';
import { LoaderService } from '../../shared/Services/loader.service';
import { Observable } from 'rxjs';
import { LoaderComponent } from '../loader/loader.component';
import { ParcelService } from '../../shared/Services/parcel.service';

@Component({
  selector: 'app-parcel-tracking',
  standalone: true,
  imports: [ReactiveFormsModule, MatTooltipModule,
      MatButtonModule, CommonModule, LoaderComponent],
  templateUrl: './parcel-tracking.component.html',
  styleUrl: './parcel-tracking.component.css'
})
export class ParcelTrackingComponent implements OnInit {
  orderForm!: FormGroup;
  apiResponse: OrderModel[] = [];
  selectedStepNo: string | null = null;
  statusMap = new Map<string, string>();
  realizedMap = new Map<number, number>();
  orderNo: string | null = null;
  stepDetails: any[] = [];
  hoveredStepNo: string | null = null;
  isTableLocked: boolean = false;
  issueMap = new Map<string, boolean>();
  public isLoading$!: Observable<boolean>;

   seqGroups = new Map<number, string[]>([
    [0, ['1', '2']],
    [1, ['3', '4']],
    [2, ['5']],
    [3, ['6']],
    [4, ['7']],
  ]);

  orderSteps = [
    { no: '1', label: 'CREA', imgBlue: 'img/Crea.jpg', imgGray: 'img/Crea-SZARE.jpg' },
    { no: '3', label: 'ARRHUB', imgBlue: 'img/Arrhub.jpg', imgGray: 'img/Arrhub-SZARE.jpg' },
    { no: '5', label: 'ARRPFDISTRI', imgBlue: 'img/Arrpfdistri.jpg', imgGray: 'img/Arrpfdistri-SZARE.jpg' },
    { no: '6', label: 'DEPMKR', imgBlue: 'img/Depmkr.jpg', imgGray: 'img/Depmkr-SZARE.jpg' },
    { no: '7', label: 'DEL', imgBlue: 'img/Del.JPG', imgGray: 'img/Del-SZARE.JPG' },
  ];

  constructor(
    private fb: FormBuilder,
    private parcelService: ParcelService,
    private route: ActivatedRoute,
    private router: Router,
    private elRef: ElementRef,
    private loaderService : LoaderService
  ) {
   
   }

 
  ngOnInit() {
    debugger
    this.isLoading$! = this.loaderService.isLoading;
    const param = this.route.snapshot.paramMap.get('id');
    this.orderNo = param;
    if (this.orderNo) {
    this.loaderService.addRequest(this.parcelService.parcelTracking(this.orderNo)).subscribe({
      next: (data: OrderModel[]) => {
         this.apiResponse = data;
        this.statusMap.clear();
        this.issueMap.clear();
       
        // Populate status and issue maps
        data.forEach(item => {
          this.statusMap.set(item.seqNo, item.seqStatus);
          if (item.seqStatus === 'ISSUE') {
            this.issueMap.set(item.seqNo, true);
          }
        });

        // Calculate realized counts per group (count REALIZED or ISSUE as “done”)
        this.realizedMap.clear();
        this.seqGroups.forEach((seqArr, groupIndex) => {
          const count = seqArr.filter(seqNo => {
            const status = this.statusMap.get(seqNo);
            return status === 'REALIZED' || status === 'ISSUE';
          }).length;
          this.realizedMap.set(groupIndex, count);
          console.log(`Group ${groupIndex} seqNos ${seqArr} realized count: ${count}/${seqArr.length}`);
        });

        // 1. Find the last seqNo with isDone === '1'
        const lastDoneSeq = data
          .filter(item => item.isDone === '1' || item.seqStatus === 'ISSUE')
          .map(item => Number(item.seqNo))
          .sort((a, b) => b - a)[0]; // highest seqNo with isDone = 1

        if (lastDoneSeq !== undefined) {
          // 2. Set selectedStepNo and fetch details for lastDoneSeq
          this.selectedStepNo = lastDoneSeq.toString();
          this.isTableLocked = true; // lock the table since a step is selected

          this.fetchStepDetails(this.selectedStepNo);
        }
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
  }
}

  // Returns seq array for given group index
  getSeqArrayForStep(index: number): string[] {
    return this.seqGroups.get(index) || [];
  }

  // Returns true if button (step) is fully realized (all seqs REALIZED or ISSUE)
  isButtonActive(index: number): boolean {
    
    const seqArr = this.getSeqArrayForStep(index);
    const realizedCount = this.realizedMap.get(index) || 0;
     return realizedCount > 0;
    // return realizedCount === seqArr.length;
  }

  // Check if any seq in button group has an ISSUE
  hasIssueInGroup(index: number): boolean {
    const seqArr = this.getSeqArrayForStep(index);
    return seqArr.some(seqNo => this.issueMap.get(seqNo) === true);
  }

  // Returns true if a particular seqNo has issue (for showing ! sign)
  hasIssue(seqNo: string): boolean {
    return this.getStatus(seqNo) === 'ISSUE';
    //return this.issueMap.get(seqNo) === true;
  }

getSeqCountForStep(index: number): number {
  return this.seqGroups.get(index)?.length || 0;
}

// Check if any button has 'ISSUE' status
hasAnyIssue(): boolean {
  return this.orderSteps.some(step => this.getStatus(step.no) === 'ISSUE');
}

// Check if all buttons are 'REALIZED' (no 'ISSUE' allowed)
areAllDone(): boolean {
  debugger
   if (!this.apiResponse || this.apiResponse.length === 0) return false;
  return this.apiResponse.every(item => item.isDone === '1');
}

getStatus(seqNo: string): string | undefined {
  
  return this.statusMap.get(seqNo);
}

getButtonColor(seqNo: string): 'blue' | 'gray' {
  const status = this.getStatus(seqNo);
  if (status === 'REALIZED' || status === 'ISSUE') return 'blue';
  return 'gray'; // treat NOTDONE and others as gray
}

  // Bar color logic per your requirement
 getBarColor(barIndex: number): 'blue' | 'half' | 'gray' {
  switch (barIndex) {
    case 0: { // bar 1 depends on seq 2 and seq 3
      const status2 = this.getStatus('2');
      const status3 = this.getStatus('3');

      if (status2 === 'NOTDONE' || !status2) return 'gray';
      if ((status3 === 'REALIZED' || status3 === 'ISSUE')) return 'blue';
      if (status2 === 'REALIZED') return 'half';
      return 'gray';
    }
    case 1: { // bar 2 depends on seq 4 and seq 5
      const status4 = this.getStatus('4');
      const status5 = this.getStatus('5');

      if (status4 === 'NOTDONE' || !status4) return 'gray';
      if ((status5 === 'REALIZED' || status5 === 'ISSUE')) return 'blue';
      if (status4 === 'REALIZED') return 'half';
      return 'gray';
    }
    case 2: { // bar 3 depends on seq 6
      const status6 = this.getStatus('6');
      if (status6 === 'REALIZED' || status6 === 'ISSUE') return 'blue';
      return 'gray';
    }
    case 3: { // bar 4 depends on seq 7
      const status7 = this.getStatus('7');
      if (status7 === 'REALIZED' || status7 === 'ISSUE') return 'blue';
      return 'gray';
    }
    default:
      return 'gray';
  }
}

  // Show ! sign on button if any seq in that group has issue
  showExclamation(index: number): boolean {   
    const validSeqNos = this.orderSteps.map(step => step.no); // Get list of seqNos that have buttons
  const groupSeqNos = this.getSeqArrayForStep(index);
  
  return groupSeqNos.some(seqNo =>
    this.issueMap.get(seqNo) === true && validSeqNos.includes(seqNo)
  );
  }

  // For buttons - get step no for group index (your orderSteps list uses 'no' field)
  getStepNoByIndex(index: number): string {
    return this.orderSteps[index]?.no || '';
  }

  // Button click etc.

 onStepClick(seqNo: string) {
if (!this.isSeqNoButtonActive(seqNo)) return;

  if (this.selectedStepNo === seqNo) {
    // Hide grid on clicking same bubble again
    this.selectedStepNo = null;
    this.stepDetails = [];
    this.isTableLocked = false;
  } else {
    // Show grid for newly clicked bubble
    this.selectedStepNo = seqNo;
    this.isTableLocked = true;
    this.fetchStepDetails(seqNo);
  }
  }

  selectStep(seqNo: string) {
    if (this.isSeqNoButtonActive(seqNo)) {
      this.isTableLocked = true;
      this.selectedStepNo = seqNo;
      this.fetchStepDetails(seqNo);
    }
  }

  fetchStepDetails(seqNo: string) {  
    debugger  
    this.parcelService.parcelTrackingBy_Seq(this.orderNo?.toString() || '', Number(seqNo)).subscribe({
      next: (data) => {
        this.stepDetails = data;
      },
      error: (err) => {
        console.error('Error fetching step details:', err);
      }
    });
  }

  isSeqNoButtonActive(seqNo: string): boolean {
    
    const index = this.orderSteps.findIndex(step => step.no === seqNo);
    if (index === -1) return false;
    return this.isButtonActive(index);
  }

  goBack() {
    this.router.navigate(['/']);  // Navigate to root URL
  }

  onStepHover(seqNo: string) {
    
    console.log('Hover on seqNo:', seqNo, 'isTableLocked:', this.isTableLocked, 'active:', this.isSeqNoButtonActive(seqNo));
      if (!this.isTableLocked && this.isSeqNoButtonActive(seqNo)) {
      this.hoveredStepNo = seqNo;
      this.fetchStepDetails(seqNo);
    }
  }

  onStepLeave() {
    if (!this.isTableLocked) {
      this.hoveredStepNo = null;
      this.stepDetails = [];
    }
  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;

    // If table not shown or not locked, no need to do anything
    if (!this.stepDetails.length || !this.isTableLocked) return;

    // If click is inside the component
    const clickedInside = this.elRef.nativeElement.contains(clickedElement);

    // Allow click inside the table or step buttons to pass
    const isTableClick = clickedElement.closest('.table-scroll-container');
    const isButtonClick = clickedElement.closest('button');

    if (!clickedInside || (!isTableClick && !isButtonClick)) {
      this.selectedStepNo = null;
      this.hoveredStepNo = null;
      this.stepDetails = [];
      this.isTableLocked = false;
    }
  }


  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.selectedStepNo = null;
      this.stepDetails = [];
      this.isTableLocked = false;
      this.hoveredStepNo = null;
      return;
    }

    if (!this.selectedStepNo) {
      return; // nothing selected, ignore
    }

    const currentIndex = this.orderSteps.findIndex(step => step.no === this.selectedStepNo);
    if (currentIndex === -1) return;

    if (event.key === 'ArrowRight') {
      this.selectNextStep(currentIndex);
      event.preventDefault();
    } else if (event.key === 'ArrowLeft') {
      this.selectPreviousStep(currentIndex);
      event.preventDefault();
    }
  }

  selectNextStep(currentIndex: number) {
    // find next active button (blue) after currentIndex
    for (let i = currentIndex + 1; i < this.orderSteps.length; i++) {
      if (this.isButtonActive(i)) {
        this.setSelectedStep(i);
        break;
      }
    }
  }

  selectPreviousStep(currentIndex: number) {
    // find previous active button (blue) before currentIndex
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (this.isButtonActive(i)) {
        this.setSelectedStep(i);
        break;
      }
    }
  }

  setSelectedStep(index: number) {
    this.selectedStepNo = this.orderSteps[index].no;
    this.selectStep(this.selectedStepNo);
  }

}
