import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LearnerRegistrationService } from 'src/app/services/http/learner-registration.service';

@Component({
  selector: 'app-registration-To-parent',
  templateUrl: './registration-To-parent.component.html',
  styleUrls: ['./registration-To-parent.component.css']
})
export class RegistrationToParentComponent implements OnInit {
  public infoMessage: string = '';
  public submitSuccess = false
  public submitionFlag: boolean = true;
  public loadingGifFlag: boolean = false;
  messageColor: string
  submit=false
  @Input() command
  @Input() newLearner;
  @Input() whichLearner;
  @ViewChild('registrationForm') registrationForm
  @Output() refreshFlag: EventEmitter<any> = new EventEmitter();
  constructor(public activeModal: NgbActiveModal, private learnerRegServer: LearnerRegistrationService) { }

  ngOnInit() {
    console.log(this.registrationForm)
  }

  onSubmit() {
    this.submitionFlag = false;
    this.infoMessage = 'loading.....'
    this.loadingGifFlag = true;
    let valueToSubmit = this.registrationForm.parentForm.value;
    console.log(valueToSubmit)
    let vailadValue = this.checkInputVailad(valueToSubmit);
    if (vailadValue !== null) {
      this.stringifySubmitStr(vailadValue)
    }
    else {
      this.infoMessage = 'Value has not changed.'
      return;
    }
  }

  checkInputVailad(valueToSubmit) {
    //once click save btn, touch all inputs form with for-loop. In order to trigger Validator
    for (let i in this.registrationForm.parentForm.controls) {
      this.registrationForm.parentForm.controls[i].touched = true;
    }
    //when input value pass the check of Validators, there is a [status] attr equal to 'VALID'
    if (this.registrationForm.parentForm.status == 'VALID') {
      return this.prepareSubmitData(valueToSubmit);
    }
    else {
      this.infoMessage = 'Please check your input.'
      this.loadingGifFlag = false;
      this.messageColor = '#dc3545';
      this.submitionFlag = true;
      return null;
    }
  }

  prepareSubmitData(valueToSubmit){
    valueToSubmit.Relationship = Number(valueToSubmit.Relationship)
    return valueToSubmit
  }

  stringifySubmitStr(vailadValue){
    let submit = new FormData();


    submit.append('details', JSON.stringify(vailadValue))
    this.submitByMode(submit)
  }

  submitByMode(submit) {
    if (this.command == 1) {
      let obj = this.learnerRegServer.postStudent(submit)
      this.subscribeHandler(obj);
    }
    else if (this.command == 2) {
      let obj = this.learnerRegServer.putStudent(this.whichLearner.LearnerId, submit)
      this.subscribeHandler(obj);
    }
  }

  subscribeHandler(obj) {
    obj.subscribe(
      (res) => {
        this.showInfoMessage('Submit success!', '#28a745', false)
        this.submitionFlag = false;
        this.submit= true;
      },
      (err) => {
        if (err.error.ErrorMessage == 'Learner has exist.') {
          this.showInfoMessage(err.error.ErrorMessage + ' Please check ID Number.', '#dc3545', false);
          this.submitionFlag = true;
        }
        else {
          this.showInfoMessage('Sorry, there are something wrong in server.', '#dc3545', false);
          this.submitionFlag = true;
        }
        console.log('Error', err);
      }
    );
  }

  showInfoMessage(msg, fontColor, gifFlag) {
    this.infoMessage = msg;
    this.loadingGifFlag = gifFlag;
    this.messageColor = fontColor;
  }

  onClose(command,whichLearner) {
    if ( this.submit==true || this.registrationForm.parentForm.dirty == true) {
      this.refreshFlag.emit(true);
      if(command == 1){
       //@ts-ignore
      const modalRef = this.modalService.open(RegistrationToParentComponent, { size: 'xl', backdrop: 'static', keyboard: false });
      modalRef.componentInstance.command = command;
      modalRef.componentInstance.newLearner = this.registrationForm.parentForm
    }
  }
    else {
      this.refreshFlag.emit(false);
    }
    this.activeModal.close('Cross click');
  }
}


