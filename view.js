
const remote = require('@electron/remote')

function OpenFileDialog(path) {
    var filename = remote.dialog.showOpenDialogSync(null, {
        properties: ['openFile'],
        filters: [{ name: 'All Files', extensions: ['*'] },{ name: 'H5 File, csv, txt', extensions: ['h5','csv','txt'] }],
        title: 'Select',
        defaultPath: path
    });
    if (filename) { return filename; } else { return path; }
}
function SaveFileDialog(path) {
    var filename = remote.dialog.showSaveDialogSync(null, {
        filters: [{ name: 'H5 File', extensions: ['h5'] },{ name: 'All Files', extensions: ['*'] }],
        title: "Save file",
        defaultPath: path
    });
    if (filename) { return filename; } else { return path; }
}
function SaveImg(path,img) {
    var filename = remote.dialog.showSaveDialogSync(null, {
        filters: [{ name: 'png', extensions: ['png'] }],
        title: "Save file",
        defaultPath: path
    });
    var fs = require('fs');
    if (filename) {
        fs.writeFile(filename, img, 'base64', function (err) { console.log(err); });
    } else { return; }
}
document.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation();
    for (const f of e.dataTransfer.files) {
        var path = require('path');
        var p=path.parse(f.path);
        if ( p.ext == ".h5" ){             
          document.getElementById("input_path").value=f.path
          document.getElementById("output_path").value=path.join(p.dir,p.name+"_RECODE"+p.ext)  
          document.getElementById("btn_process").dispatchEvent(new Event('click'))
        }
    }
});
document.getElementById("input_path").addEventListener('change', function() {
    var path = require('path');
    var input_path = document.getElementById("input_path").value;
    var p=path.parse(input_path);
    document.getElementById("output_path").value=path.join(p.dir,p.name+".RECODE"+p.ext)  
}, false);

document.getElementById("btn_input_path").addEventListener('click', function() {
    document.getElementById("input_path").value=OpenFileDialog(document.getElementById("input_path").value)
    if (document.getElementById("input_path").value){
        var path = require('path');
        p=path.parse(document.getElementById("input_path").value);        
        switch (p.ext.toLowerCase()) {
          case ".h5":
            $("#file_type").val("h5");
            break;
          case ".csv":
            $("#file_type").val("csv");
            break;
          case ".tsv":
            $("#file_type").val("tsv");
            break;
          default:
            $("#file_type").val("ssv");
            break;
        } 
        document.getElementById("input_path").dispatchEvent(new Event('change'))
    }
}, false);
document.getElementById("btn_output_path").addEventListener('click', function() {
    document.getElementById("output_path").value=SaveFileDialog(document.getElementById("output_path").value)
}, false);

document.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
});
const rmDir = (dirPath) => {
  var fs = require('fs');
  var path = require('path');
  if (!fs.existsSync(dirPath)) { return }

  // file or dir
  const items = fs.readdirSync(dirPath)
  for (const item of items) {
    const deleteTarget = path.join(dirPath, item)
    if (fs.lstatSync(deleteTarget).isDirectory()) {
      rmDir(deleteTarget)
    } else {
      fs.unlinkSync(deleteTarget)
    }
  }
  fs.rmdirSync(dirPath)
}
const addImage= (fpath, dom) =>{
    var fs = require('fs');
    var path = require('path');
    const binary = fs.readFileSync(fpath)
    const base64data = new Buffer.from(binary).toString('base64');
    console.log(path.basename(fpath));
    var id=Math.random().toString(32).substring(2);
    var img=$("<img>",{
        id: id,
        class: "saveimg",
        src: "data:image/png;base64,"+base64data
    });
    dom.append(img);
    $.contextMenu({
        selector: '#'+id,
        callback: function(key, options) {
            SaveImg(path.basename(fpath),$(this).attr('src').replace(/^data:image\/png;base64,/, ""));
        },
        items: { save: {name: "Save", icon: "fas fa-save"} }
    });
    return img;
}

// test img
/*$(function() {
    var fs = require('fs');
    if (fs.existsSync("check_applicability.png")) { i=addImage("check_applicability.png",$("#r_1-1")); }
});*/

function dispLoading(msg){
  if( msg == undefined ){ msg = ""; }
  var dispMsg = `
  <div class="loadingMsg">
  <p><i class="fa fa-circle-notch fa-spin fa-8x fa-fw" style="color: cornflowerblue;"></i></p>
  <p id="progress_message">` + msg + `</p>
  <button id='btn_kill' class='btn btn-danger btn-block'>Cancel</button>
  </div>`;

  if($("#loading").length == 0){
    $("#mainwindow").append("<div id='loading'>" + dispMsg + "</div>");
  }else{
    $("#loading").find("#progress_message").text(msg);
  }
}
function removeLoading(){
  $("#loading").remove();
}
var cancel;
document.getElementById("btn_reload").addEventListener('click',function(){
    const {getCurrentWindow, globalShortcut} = remote
    getCurrentWindow().reload()
})
document.getElementById("btn_process").addEventListener('click', function() {
        var a=1, b=5
        cancel=0;
        let childProcess = remote.require("child_process");
        var input_path = document.getElementById("input_path").value;
        var output_path = document.getElementById("output_path").value;
        if (!input_path || !output_path){
            alert("Set the input and output files");
            return;
        }
        $("#message").empty();
        dispLoading("Processing "+a+"/"+b);
        var path = require('path');
        document.getElementById("btn_process").disabled=true
        log = document.getElementById("log")
        var apppath = remote.app.getAppPath().replace('app.asar', 'app.asar.unpacked');
        bin='"'+path.join(apppath,"python","bin","python3")+'"'
        var python_script=path.join(apppath,"python","conv.py")
        var args=['"'+python_script+'"', '"'+input_path+'"', '"'+output_path+'"'  , $("#seq_target").val(), $("#file_type").val(), $("#mat_form").val(), $("#id_header").prop("checked"), $("#id_index").prop("checked")]
        
        var workdir = path.join(remote.app.getPath("temp"),"RECODE_"+Math.random().toString(32).substring(2));
        var fs = require('fs');
        if (!fs.existsSync(workdir)) fs.mkdirSync(workdir);

        //var workdir = remote.app.getAppPath();
        //bin=path.join("sleep");
        //args=["1"]

        
        log.value += bin + " " + args.join(" ") + "\n";
        console.log(workdir);
        var proc = childProcess.spawn(bin, args, {shell: true, cwd: workdir, env: {MPLCONFIGDIR:workdir} })
        proc.on('exit', (code)=>{
            removeLoading();
            document.getElementById("btn_process").disabled=false
            if (code === 0){
                result="Success"
            }else{
                result="Failed"
                if (!cancel){$("#message").append("<h2 style='color:red;'>Processing failed</h2>")};
            }
            $("#r_1-1").empty();
            $("#r_1-2").empty();
            $("#r_1-3").empty();
            $("#r_1-4").empty();
            $("#r_1-5").empty();
            log.value+="Finished. " + result + "\n";

            op=path.parse(output_path);
            var dir=path.join(op.dir,op.name);

            pngfile="report.png"
            file=path.join(workdir,pngfile);
            if ($("#img").prop("checked")){
                if (fs.existsSync(file)) { fs.copyFileSync(file,path.join(op.dir,op.name+"_"+pngfile)) }
            }
            if (fs.existsSync(file)) { i=addImage(file,$("#r_1-1")); }

            // pngfile="check_applicability.png"
            // file=path.join(workdir,pngfile);
            // if ($("#img").prop("checked")){
            //     if (fs.existsSync(file)) { fs.copyFileSync(file,path.join(op.dir,op.name+"."+pngfile)) }
            // }
            // if (fs.existsSync(file)) { i=addImage(file,$("#r_1-1")); }

            // pngfile="plot_mean_variance_Original.png"
            // file=path.join(workdir,pngfile);
            // if ($("#img").prop("checked")){
            //     if (fs.existsSync(file)) { fs.copyFileSync(file,path.join(op.dir,op.name+"."+pngfile)) }
            // }
            // if (fs.existsSync(file)) { i=addImage(file,$("#r_1-2")); }

            // pngfile="plot_mean_variance_RECODE.png"
            // file=path.join(workdir,pngfile);
            // if ($("#img").prop("checked")){
            //     if (fs.existsSync(file)) { fs.copyFileSync(file,path.join(op.dir,op.name+"."+pngfile)) }
            // }
            // if (fs.existsSync(file)) { i=addImage(file,$("#r_1-3")); }

            // pngfile="plot_mean_cv_Original.png"
            // file=path.join(workdir,pngfile);
            // if ($("#img").prop("checked")){
            //     if (fs.existsSync(file)) { fs.copyFileSync(file,path.join(op.dir,op.name+"."+pngfile)) }
            // }
            // if (fs.existsSync(file)) { i=addImage(file,$("#r_1-4")); }

            // pngfile="plot_mean_cv_RECODE.png"
            // file=path.join(workdir,pngfile);
            // if ($("#img").prop("checked")){
            //     if (fs.existsSync(file)) { fs.copyFileSync(file,path.join(op.dir,op.name+"."+pngfile)) }
            // }
            // if (fs.existsSync(file)) { i=addImage(file,$("#r_1-5")); }

            
            /*
            i=addImage(path.join(workdir + "plot_procedures_1_Original.png"),currentDiv);
            i.width="200";
            i=addImage(path.join(workdir + "plot_procedures_2_Normalized.png"),currentDiv);
            i.width="200";
            i=addImage(path.join(workdir + "plot_procedures_3_Projected.png"),currentDiv);
            i.width="200";
            i=addImage(path.join(workdir + "plot_procedures_4_Variance-modified.png"),currentDiv);
            i.width="200";
            i=addImage(path.join(workdir + "plot_procedures_5_Denoised.png"),currentDiv);
            i.width="200";
            */
            rmDir(workdir);
        });
        ipcRenderer.send('pid-message', proc.pid);
        $("#btn_kill").off('click');
        $("#btn_kill").on('click', function() {
          var kill  = remote.require('tree-kill');
          kill(proc.pid);
          cancel=1
        });
        proc.stdout.on("data", function(data){
            log.value+=data.toString();
        });
        proc.stderr.on("data", function(data){
            var str=data.toString();
            if(str.match(/^----.*/)){
                a++;
                dispLoading("Processing "+a+"/"+b);
            }
            log.value+=str;
        });

});


document.getElementById("btn_update").addEventListener('click', function() {
        cancel=0;
        let childProcess = remote.require("child_process");
        $("#message").empty();
        dispLoading("Updating");
        var path = require('path');
        document.getElementById("btn_update").disabled=true
        log = document.getElementById("log")
        var apppath = remote.app.getAppPath().replace('app.asar', 'app.asar.unpacked');
        bin='"'+path.join(apppath,"python","bin","python3")+'"'
        var args=["-m", "pip" , "install", "--upgrade", "screcode"]
        log.value += bin + " " + args.join(" ") + "\n";        
        var proc = childProcess.spawn(bin, args, {shell: true})
        proc.on('exit', (code)=>{
            removeLoading();
            document.getElementById("btn_update").disabled=false
            if (code != 0){
                if (!cancel){$("#message").append("<h2 style='color:red;'>Update failed</h2>")};
            }
        });
        ipcRenderer.send('pid-message', proc.pid);
        $("#btn_kill").off('click');
        $("#btn_kill").on('click', function() {
          var kill  = remote.require('tree-kill');
          kill(proc.pid);
          cancel=1
        });
        proc.stdout.on("data", function(data){
            log.value+=data.toString();
        });
        proc.stderr.on("data", function(data){
            var str=data.toString();
            log.value+=str;
        });

});

