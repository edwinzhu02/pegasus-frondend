import {
  Component,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
  ViewChild
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  Validators,
  FormControlName
} from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { NgbPopover } from "@ng-bootstrap/ng-bootstrap";
import { NgbootstraptableService } from "src/app/services/others/ngbootstraptable.service";
import { AppSettingsService } from "src/app/settings/app-settings.service";
import { Subscription } from "rxjs";
import { UsersService } from "src/app/services/http/users.service";
import { DashboardService } from "../../../../services/http/dashboard.service";
import { SessionsService } from 'src/app/services/http/sessions.service';
@Component({
  selector: "app-dashboard-home",
  templateUrl: "./dashboard-home.component.html",
  encapsulation: ViewEncapsulation.None,
  styleUrls: ["./dashboard-home.component.css"]
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  notices: { notice: string; origin: string }[];
  messages;
  // toDoForm: FormGroup;
  // monthFormat=[];
  dayFormat = [];
  monthFormat = [];
  noticeForm: FormGroup;
  userName: string;
  formError: string;
  pageloading: boolean = true;
  lookUpList: Subscription;
  //my to do list
  addListBoolean = false;
  popUpForm: FormGroup;
  @ViewChild("popOver") public popover: NgbPopover;
  // toDoList: {
  //   id: number;
  //   task: string;
  //   origin: string;
  //   priority: number;
  //   link: string;
  //   created_date: string;
  // }[];
  toDoList =[]

  constructor(
    public title: Title,
    private formBuilder: FormBuilder,
    public tableService: NgbootstraptableService,
    private settingService: AppSettingsService,
    private userService: UsersService,
    private dashboardService: DashboardService,
    public sessionService: SessionsService,
  ) {
    this.title.setTitle("Home");
    this.notices = [
      {
        notice: "Work Harder",
        origin: "Edwin"
      },
      {
        notice: "党中央是大脑和中枢 党中央必须有定于一尊、一锤定音的权威",
        origin: "党"
      },
      {
        notice: "紧密团结在习近平同志为核心的党中央周围奋力夺取新时代中国特色 ",
        origin: "党"
      },
      {
        notice:
          "最近中共中央会议的主要议题是“党内民主”。中国高层领导人将党内民主称为党的“生命线”和中国共产党（CCP）是否能够在未来保持其至高无上的地位的主要 ",
        origin: "党"
      },
      {
        notice:
          "中共中央印发了《中国共产党党员教育管理工作条例》（以下简称《条例》），并发出通知，要求各地区各部门认真遵照执行 ",
        origin: "党"
      }
    ];
  }

  // Fires when the component is ready for use when all queries and inputs have been resolved
  ngOnInit(): void {
    // Subscribe for all the to dos
    this.getToDoList();
    let orgString = localStorage.getItem("OrgId").slice(1, -1);
    this.dashboardService.getStatistic(orgString).subscribe(res => {
      console.log(res);
      this.messages = res.Data;
      this.messages.lowRemain = Number(res.Data.studentWith2RemainLessonsForToday +res.Data.studentWith1RemainLessonForToday +res.Data.studentWith0RemainLessonForToday)
    });

    this.userName = localStorage.getItem("userFirstName");
    this.pageloading = false;
    // build popUpForm
    this.popupListFormBuilder();

    // this.tableService.sorting(this.toDoList, 'priority')

    // Get Lookup list
  }

  // get to do list from user service
  getToDoList() {
    this.userService.getToDoList().subscribe(
      res => {
        this.toDoList = res["Data"];
        this.toDoList.forEach(ele=>{
          ele['deleteListBoolean'] = true;
        })
        this.getDate(res["Data"]);
        console.log(this.toDoList)
      },
      err => console.warn(err)
    );
  }
  // get date of to do list
  getDate(date) {
    let dateFormat = [];
    let dateSing = [];
    date.forEach(list => {
      //@ts-ignore
      dateFormat.push(list.TodoDate.slice(0, 10));
    });
    dateFormat.forEach(x => {
      dateSing.push(x.split("-")[1]);
      this.dayFormat.push(x.split("-")[2]);
      this.changeNumberToMonth(dateSing);
    });
  }

  changeNumberToMonth(array) {
    let array2 = [
      "Jun",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    this.monthFormat = array.map(v => {
      return array2[v - 1];
    });
  }

  markToDoAsCompletedAPI(taskID) {
    this.userService
      .updateToDoList(taskID)
      .subscribe(res => console.log(res), err => console.warn(err));
  }

  // Called after component’s views are initialized
  ngAfterViewInit(): void {
    this.lookUpList = this.settingService.currentLookUpSettings.subscribe(
      res => {}
    );
  }

  // newTaskFormBuilder(){
  //   this.toDoForm = this.formBuilder.group({
  //     task:['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]]
  //   })
  // }
  newNoticeFormBuilder(): void {
    this.noticeForm = this.formBuilder.group({
      notice: [
        "",
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(200)
        ]
      ]
    });
  }

  newNoticeSubmit(): void {
    console.log(this.noticeForm);
    if (this.noticeForm.dirty && this.noticeForm.valid) {
      this.noticeForm.value["origin"] = this.userName;

      this.sendToBackend();

      this.notices.push(this.noticeForm.value);
      this.popover.close();
    } else {
      this.formError = "Please enter your task.";
    }
  }

  // Popover manupulation
  openOrClosePopOver(position): void {
    if (!this.popover.isOpen()) {
      this.popover.open(), (this.popover.placement = position);
    }
  }

  sendToBackend() {}

  completedTask(taskID) {
    // First prepare to delete this on the Backend
    this.markToDoAsCompletedAPI(taskID);
    // Then takeout the object from the observable here for quick view
    this.toDoList.forEach((item, key) => {
      if (item["ListId"] == taskID) {
        this.toDoList.splice(key, 1);
      }
    });
  }

  //------popup to do list
  popupListFormBuilder(){
    this.popUpForm = this.formBuilder.group({
      title: '',
      content:'',
      deleteListBoolean:true
    })
  }

  clickAddList(){
    this.addListBoolean = !this.addListBoolean;
  }

  closePopUp(){
    this.addListBoolean = !this.addListBoolean;
  }

  saveList(){
    this.addListBoolean = !this.addListBoolean;
    // push new List
    let objNew = {};

    objNew['ListName'] = this.popUpForm.value.title;
    objNew['ListContent'] = this.popUpForm.value.content;
    objNew['deleteListBoolean'] = this.popUpForm.value
    this.popUpForm.reset();
    this.toDoList.push(objNew);
    console.log(this.toDoList);
  }
  deleteList(i,num){
    this.toDoList[i].deleteListBoolean = !this.toDoList[i].deleteListBoolean;
    if (num ==1){
      this.toDoList.splice(i,1);
    }
    if (num == 0){
      this.move(i);
    }
  }
  // list move to top
  move(i){
     let temp = this.toDoList[i];
     this.toDoList[i] = this.toDoList[0];
     this.toDoList[0] = temp
  }
  drag(){
    let header = document.querySelector('#popUpHeader');

  }

  // move popup
//   mydragg(){
//     return {
//         move : function(divid,xpos,ypos){
//             divid.style.left = xpos + 'px';
//             divid.style.top = ypos + 'px';
//         },
//         startMoving : function(divid,container,evt){
//             evt = evt || window.event;
//             var posX = evt.clientX,
//                 posY = evt.clientY,
//             divTop = divid.style.top,
//             divLeft = divid.style.left,
// eWi = parseInt(divid.style.width),
// eHe = parseInt(divid.style.height),
// cWi = parseInt(document.getElementById(container).style.width),
// cHe = parseInt(document.getElementById(container).style.height);
// document.getElementById(container).style.cursor='move';
//             divTop = divTop.replace('px','');
//             divLeft = divLeft.replace('px','');
//             var diffX = posX - divLeft,
//                 diffY = posY - divTop;
//             document.onmousemove = function(evt){
//                 evt = evt || window.event;
//                 var posX = evt.clientX,
//                     posY = evt.clientY,
//                     aX = posX - diffX,
//                     aY = posY - diffY;
//     if (aX < 0) aX = 0;
//     if (aY < 0) aY = 0;
//     if (aX + eWi > cWi) aX = cWi - eWi;
//     if (aY + eHe > cHe) aY = cHe -eHe;
//                 this.mydragg.move(divid,aX,aY);
//             }
//         },
//         stopMoving : function(container){
//             var a = document.createElement('script');
// document.getElementById(container).style.cursor='default';
//             document.onmousemove = function(){}
//         },
//     }
//   };

  // This is called just before the component is destoryed
  ngOnDestory() {
    this.lookUpList.unsubscribe();
  }
}
