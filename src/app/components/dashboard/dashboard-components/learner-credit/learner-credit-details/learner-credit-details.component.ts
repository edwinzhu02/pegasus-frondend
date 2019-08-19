import { Component, OnInit, Input } from "@angular/core";
import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { LearnersService } from "../../../../../services/http/learners.service";
import { NgbootstraptableService } from "../../../../../services/others/ngbootstraptable.service";
import { GeneralRepoService } from "../../../../../services/repositories/general-repo.service";

@Component({
  selector: "app-learner-credit-details",
  templateUrl: "./learner-credit-details.component.html",
  styleUrls: ["./learner-credit-details.component.css"]
})
export class LearnerCreditDetailsComponent implements OnInit {
  // get learner id from model template component
  @Input() whichLearner;
  public learner: any;
  public learnerId: number;
  public remainingCourseData: any;
  public arrangedCourseData: any;
  public remainingDataWaitingFlag = false;
  public arrangeDataWaitingFlag = false;
  public courseId: number;

  constructor(
    private learnerService: LearnersService,
    private ngTableService: NgbootstraptableService,
    private router: Router,
    private generalRepoService: GeneralRepoService
  ) {}

  ngOnInit() {
    this.generalRepoService.fisrtName.subscribe(
      data => {
        if (data == "Customer Name") {
          this.learnerId = +this.router.url.slice(
            this.router.url.lastIndexOf("/") + 1
          );
        } else {
          this.learner = data;
          this.learnerId = this.learner.LearnerId;
        }
        this.getRemainingCourses();
        this.getArrangedLesson();
      },
      err => console.log(err)
    );
  }

  getRemainingCourses() {
    this.remainingDataWaitingFlag = true;
    this.learnerService.getRemainingCourses(this.learnerId).subscribe(
      data => {
        this.remainingCourseData = data["Data"];
        this.remainingDataWaitingFlag = false;
      },
      error => console.log(error)
    );
  }

  getArrangedLesson() {
    this.arrangeDataWaitingFlag = true;
    this.learnerService.getArrangedLesson(this.learnerId).subscribe(
      data => {
        this.arrangedCourseData = data["Data"];
        this.arrangeDataWaitingFlag = false;
      },
      error => console.log(error)
    );
  }

  onSort(tableName: string, orderBy: string) {
    if (tableName == "arrangedTable") {
      this.ngTableService.sorting(this.arrangedCourseData, orderBy);
    } else if (tableName == "remaningTable") {
      this.ngTableService.sorting(this.remainingCourseData, orderBy);
    }
  }

  navigateToArrange(index) {
    this.courseId =
      this.remainingCourseData[index].CourseInstanceId ||
      this.remainingCourseData[index].GroupCourseInstanceId;

    let url = this.router.routerState.snapshot.url;
    url = url.substring(0, url.indexOf("/", 1));
    this.router.navigate([
      url + "/arrange/" + this.learnerId + "/" + this.courseId
    ]);
  }

  alertForNoRemainingCourse() {
    alert("Sorry, you don't have remaining course");
  }
}
