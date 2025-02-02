import { Component, OnInit } from "@angular/core";
import * as ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import UploadAdapter from "./publish-upload";
import { AdminPublishService } from "../../../../../services/http/admin-publish.service";

@Component({
  selector: "app-publish-panel",
  templateUrl: "./publish-panel.component.html",
  styleUrls: ["./publish-panel.component.css"]
})
export class PublishPanelComponent implements OnInit {
  public Editor = ClassicEditor;
  public model = {
    editorData: "<p>Hello, world!</p>",
    title: "",
    radio: 1,
    top: false
  };
  titleNode;
  node: Node;
  parser = new DOMParser();
  previewFlag: boolean;
  userId;

  constructor(private publishService: AdminPublishService) {}

  ngOnInit() {
    this.userId = localStorage.getItem("userID");
  }

  onReady = eventData => {
    eventData.plugins.get("FileRepository").createUploadAdapter = loader => {
      return new UploadAdapter(loader, this.publishService);
    };
  };

  createNode = () => {
    this.node = document.querySelector("#previewContainer");
    this.titleNode = document.createElement("header");
    this.titleNode.innerHTML =
      "<h2><strong>" + this.model.title + "</strong></h2>";
    while (this.node.hasChildNodes()) {
      this.node.removeChild(this.node.firstChild);
    }
    const doc = this.parser.parseFromString(this.model.editorData, "text/html");

    this.appendMeta(doc);

    const bodyElement = doc.documentElement.querySelector("body");
    bodyElement.insertBefore(this.titleNode, bodyElement.firstElementChild);
    bodyElement.classList.add("ck-content");
    bodyElement.style.setProperty("margin", "1rem", "important");
    return doc.documentElement;
  };

  appendMeta = doc => {
    const metaTag = document.createElement("meta");
    metaTag.name = "viewport";
    metaTag.content =
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
    doc.documentElement.querySelector("head").appendChild(metaTag);
  };

  prepareData = () => {
    const element = this.createNode();
    const image = element.querySelector("body").getElementsByTagName("img")[0]; // 默认第一张图为封面
    image.style.setProperty("width", "110%");
    image.style.setProperty("margin-left", "-2.5rem");
    const data: any = {};
    if (!this.model.title) {
      alert("Please fill the title");
    } else if (!image) {
      alert("Please post at least one image");
    } else {
      data.newsData = element.innerHTML;
      data.NewsTitle = this.model.title;
      data.TitleUrl = image.src;
      data.UserId = +this.userId;
      data.NewsType = this.model.radio + "";
      data.Categroy = 1;
      data.IsTop = this.model.top ? 1 : 0;
      return data;
    }
  };

  onClick = () => {
    const data = this.prepareData();
    if (data) {
      this.publishService.postNews(data).subscribe(
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );
    }
    console.log(data);
  };

  preview = () => {
    const data = this.prepareData();
    this.node.appendChild(
      this.parser.parseFromString(data.newsData, "text/html").documentElement
    );
  };
}
