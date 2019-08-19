import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TimePickerService } from 'src/app/services/http/time-picker.service';

@Component({
  selector: 'app-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.css']
})
export class TimePickerComponent implements OnInit {
  // get data form one-on-one course of learner-registration-form 
  
  @Input() customCourse;
  @Input() teaList;
  // transmit begin time picked by user from time-picker to learner-registration-form
  @Output() beginTime = new EventEmitter<any>();
 
  // loading
  public loadingFlag: boolean = false;
  // properties for rendering in HTML
  public weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  public hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  public xIndex: number[]= [0, 1, 2, 3, 4, 5, 6];
  public yIndex: number[] = [];
  public startTimeToEndTime: string;

  // define every slot's property
  public slot: any[] = []; 
  public slotTime: any[] = [];
  public learnerName: any[] = [];

  // assign data to local props from @Input
  public learnerOrgId: number;
  public teacherName: string;
  public duration: number;
  public teacherOrgId: number;
  
  // assign prop for getting data from server as parms
  public teacherId: number;
  public startDate: any;

  // prop will be output to parent component (learner-registration-form)
  public startTime: any;

  // assign data to local props from TeacherAvailableCheck API
  public arrangedArr: any[] = [];
  public dayOffArr: any[] = [];
  public tempChangeArr: any[] = [];
  public availableDayArr: any[];
  public errorMessage: string;
  dayofweek: any;

  constructor(private timePickerService: TimePickerService) {
  }

  ngOnInit() {
    this.loadingFlag = true;
    console.log('customCourse', this.customCourse,'teacherList', this.teaList);
    // define yIndex for rendering in HTML
    for(let i = 0; i < 48; i++) {
      this.yIndex.push(i);
    }
    // define property of slot
    for (let i = 0; i < 7; i++) {
      this.slot[i] = [];
      this.learnerName[i] = [];
      this.slotTime[i] = [];
      for (let j = 0; j < 49; j++) {
        this.slot[i][j] = null;
        this.learnerName[i][j] = null;
        this.slotTime[i][j] = `${Math.floor((480 + j*15)/60)} : ${(480 + j*15)%60 == 0? '00' : (480 + j*15)%60}`;
      }
    }
    // get data from @Input
    this.learnerOrgId = Number(this.customCourse.location);
    this.startDate = this.customCourse.beginDate;
    this.teacherId = this.teaList[0].TeacherId;
    this.teacherName = this.teaList[0].TeacherName;
    this.duration = this.teaList[1].Duration;
    this.dayofweek = this.customCourse.DayOfWeek;

    // get data from server 
    this.getTeacherAvailable();
  }

  /* get teacher available data from TeacherAvailableCheck API in timePickerService */
  getTeacherAvailable() {
    this.timePickerService.getTeacherAvailableCheck(this.teacherId,this.startDate).subscribe(
      (res) => {
        console.log('TeacherData',res.Data);
        this.setSpecificTime(res.Data);
        this.renderAvailableDay();
        this.renderSlotProp();
        this.loadingFlag = false;
      },
      (err) => {
        this.backendErrorHandler(err);
      }
    );
  }
  backendErrorHandler(err) {
    console.warn(err);
    if (err.error.ErrorMessage != null) {
      this.errorMessage = err.error.ErrorMessage;
    } else {
      this.errorMessage = "Error! Can't catch Data."
    }
  }


///////////////////////////////////// get and reconstruct data from server//////////////////////////////////
  /*
    convert begin time and end time to the number of y
    and then reconstruct a new arr from TeacherAvailableCheck API 
  */
  transferTime(originalArr: any[]) {
    let arr = [];
    for(let data of originalArr) {
      // convert begin time to the number of y
      let TimeBeginToArr = data.TimeBegin.split(':');
      let TimeBeginToMinutes = (+TimeBeginToArr[0]) * 60 + (+TimeBeginToArr[1]);
      let beginMinutesToY = (+TimeBeginToMinutes-480)/15;
      // convert end time to the number of y
      let TimeEndToArr = data.TimeEnd.split(':');
      let TimeEndToMinutes = (+TimeEndToArr[0]) * 60 + (+TimeEndToArr[1]);
      let endMinutesToY = (TimeEndToMinutes-480)/15;
      // reconstruct a new arr
      let obj = {};
      obj['DayOfWeek'] = data.DayOfWeek;
      obj['BeginY'] = beginMinutesToY;
      obj['EndY'] = endMinutesToY;
      obj['LearnerName'] = data.LearnerName;
      obj['OrgId'] = data.OrgId;
      arr.push(obj);
    };
    return arr;
  }
  /*
    callback transferTime function
    convert original data of array to new array for handy to manipulate
    and get teacher available day from server
  */
  setSpecificTime(teacherData: any) {
    this.arrangedArr = this.transferTime(teacherData.Arranged);
    this.dayOffArr = this.transferTime(teacherData.Dayoff);
    this.tempChangeArr = this.transferTime(teacherData.TempChange);
    this.availableDayArr = teacherData.AvailableDay;
  }

/////////////////////////////////// render server data in HTML/////////////////////////////////////////////////////////
  /* 
    define teacher's Available day for rendering in HTML 
  */
  renderAvailableDay() {
    this.availableDayArr.map((o) => {
      let xIndex = o['DayOfWeek']-1;
        for(let i = 0; i < 48; i++) {
          this.slot[xIndex][i] = 'isAvailable';
        };
    });
  }
  /* 
    define teacher's other data (Arranged,Dayoff,TempChange) from server for rendering in HTML 
  */
  defineSlotProp(originalArr: any[], prop: string) {
    for(let o of originalArr) {
      let xIndex = o['DayOfWeek']-1;
      this.learnerName[xIndex][o['BeginY']] = o['LearnerName'];
      for(let i = o['BeginY']; i < o['EndY']+1; i++) {
        this.slot[xIndex][i] = prop;
      }
    };
    return this.slot;
  }
  /* 
    callback defineSlotProp function for ngClass in HTML 
  */
  renderSlotProp() {
    this.defineSlotProp(this.arrangedArr, 'isArranged');
    this.defineSlotProp(this.dayOffArr, 'isDayOff');
    this.defineSlotProp(this.tempChangeArr, 'isTempChange');
  }

///////////////////////////////// event triggered in HTML /////////////////////////////////////////////////////////////
  mouseover(x: number, y: number) {
    this.availableDayArr.map((availableObj) => {
      if(this.dayofweek !== undefined){
        let availableX = this.dayofweek-1; 
        if(x == availableX) {
          this.checkTeacherOrg(x, y, availableObj, availableX);
         }
      }
      else{
         let availableX = availableObj['DayOfWeek']-1;
         if(x == availableX) {
          this.checkTeacherOrg(x, y, availableObj, availableX);
        }
      } 
     
     
    })
    // this.tempChangeIsAbleToPick(x, y);
  }
  mouseout(x: number, y: number) {
    this.availableDayArr.map((o) => {
      let xIndex = o['DayOfWeek']-1;
      for(let i = 0; i < 48; i++) {
        if(this.slot[xIndex][i] == "ableToPick") {
          this.slot[xIndex][i] = "isAvailable";
        }
      }
    });
    this.tempChangeArr.map((o) => {
      let xIndex = o['DayOfWeek']-1;
      for(let i = 0; i < 48; i++) {
        if(this.slot[xIndex][i] == "ableToPick") {
          this.slot[xIndex][i] = "isTempChange"
        }
      }
    })
  }
  confirm(x: number, y: number) {
    let outputObj = {};
    outputObj['BeginTime'] = this.startTime;
    outputObj['Index'] = this.teaList[2];
    outputObj['DayOfWeek'] = this.weekdays[x];
    this.beginTime.emit(outputObj);
  }

////////////////////////////// check if teacher's org includes learner's org/////////////////////////////////
  checkTeacherOrg(x: number, y: number, availableObj, availableX) {
    // let xIndex = availableObj['DayOfWeek']-1;
    let availableOrgId = availableObj.Orgs.map((o) => o.OrgId);
    /* 判断 availableDay org 是否包含 learner org */
    // availableDay org includes learner org
    if(availableOrgId.includes(this.learnerOrgId)) {
      /* 判断 available org 是否有 arranged */
      this.checkAvailableHasArranged(x, y, availableObj, availableX);
    } else {
    // availabeDay org not includes learner org
      console.log('availableOrgId not includes(this.learnerOrgId)')
      this.availableOrgNotIncludesLearnerOrg(availableX);
    }
  }
  checkAvailableHasArranged(x: number, y: number, availableObj, availableX) {
    // console.log('ss',x,y ,availableObj, availableX,this.arrangedArr)
    if(this.arrangedArr.length != 0) {
      this.arrangedArr.map((arrangedObj) => {
        let arrangedX = arrangedObj['DayOfWeek']-1;
        // if availableDay has arranged
        if(arrangedX  == availableX) {
          /* 判断 arranged org 是否等于 learner org */
          this.checkArrangedOrg(x, y, arrangedObj);
        } else {
          this.setDuration('isAvailable', 'ableToPick', x, y)
        }
      })
    } else {
      this.setDuration('isAvailable', 'ableToPick', x, y);
    }
  }
  checkArrangedOrg(x: number, y: number, arrangedObj,) {
    let arrangedOrgId = arrangedObj['OrgId'];
    if(arrangedOrgId == this.learnerOrgId) {
      // arranged 前后可选
      this.setDuration('isAvailable', 'ableToPick', x, y)
    } else {
      // arranged 前后一小时不能选
      this.aroundArrangedCanNotPick();
      this.setDuration('isAvailable', 'ableToPick', x, y)
    }
  }
  aroundArrangedCanNotPick() {
    this.arrangedArr.map((o) => {
      let xIndex = o['DayOfWeek']-1;
      for(let i = o['BeginY']-4; i < o['EndY']+5; i++) {
        if(this.slot[xIndex][i] != "isArranged") {
          this.slot[xIndex][i] = "oneHourUnableTopick";
        }
      }
    })
  }
  availableOrgNotIncludesLearnerOrg(x: number) {
    for(let i = 0; i < 48; i++) {
      if(this.slot[x][i] == "ableToPick") {
        this.slot[x][i] = "tOrgNotIncludesLOrg";
      }
    }
  }

//////////////////////////////////// deal with tempChangeArr //////////////////////////////////////////////////
  /* 
    check if temp change >= duration 
  */
  checkTempChange(x:number, y:number) {
    this.tempChangeArr.map((o) => {
      let gap = o.EndY - o.BeginY;
      if(gap+1 < this.duration) {
        return false
      }
    });
    return true;
  }
  /* 
  if temp change >= duration, 
  then tempChangeArr is able to pick 
  */
  tempChangeIsAbleToPick(x:number, y:number) {
    this.tempChangeArr.map((o) => {
      let xIndex = o.DayOfWeek-1
      if(this.checkTempChange(x,y) && x == xIndex && this.slot[x][y] == "isTempChange") {
        console.log('tempchange', this.tempChangeArr,x,y)
        this.setDuration('isTempChange', 'ableToPick', x, y);
      }
    })
  }
  
/////////////////////// check if has next duration and former duration  /////////////////////////////////////
  hasNextDuration(isAvailable: string, x: number, y: number) {
    for(let i = 0; i < this.duration+1; i++) {
      if(this.slot[x][y+i] != isAvailable) {
        return false;
      }
    };
    return true;
  }
  getBottomY(isAvailable: string, ableToPick: string, x: number, y: number) {
    for(let i = 0; i < this.duration+1; i++) {
      if(y !=0 && this.slot[x][y+i] !=isAvailable && this.slot[x][y+i] !=ableToPick) {
        return y+i-1;
      }
    }
  }
  hasFormerDuration(isAvailable: string, ableToPick: string, x: number, y: number) {
    let bottomY = this.getBottomY(isAvailable, ableToPick, x, y);
    for(let i = 0; i < this.duration+1; i++) {
      if(this.slot[x][bottomY-i] != isAvailable) {
        return false;
      }
    };
    return true;
  }
  setDuration(isAvailable: string, ableToPick: string, x: number, y: number){
    // console.log('setDuration', isAvailable, ableToPick, x, y)
    if(this.hasNextDuration(isAvailable, x, y)) {
      for(let i = 0; i < this.duration+1; i++) {
        this.slot[x][y+i] = ableToPick;
        this.startTime = `${this.slotTime[x][y]}`;
        this.startTimeToEndTime = `${this.slotTime[x][y]}-${this.slotTime[x][y+this.duration+1]}`;
      };
    } else if(this.hasFormerDuration(isAvailable, ableToPick, x, y)) {
      let bottomY = this.getBottomY(isAvailable, ableToPick, x, y);
      for(let i = 0; i < this.duration+1; i++) {
        this.slot[x][bottomY-i] = ableToPick;
      };
    }
  }

}


