/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// *****************************************************************************
// **     -----     -----     --------imports--------     -----     -----     **
// **     -----     -----     --------imports--------     -----     -----     **
// **     -----     -----     --------imports--------     -----     -----     **
// *****************************************************************************
// module to load jpg's and png's into 3D arrays
var getPixels = require("get-pixels");
// module to create and export DXF format files
var makerjs = require('makerjs');
// module to export files
var fs = require('fs');
// module to get args from the user
var readline = require('readline');
// module to set up server
var net = require('net');

// *****************************************************************************
// **     -----     -----     -----declerations!-----     -----     -----     **
// **     -----     -----     -----declerations!-----     -----     -----     **
// **     -----     -----     -----declerations!-----     -----     -----     **
// *****************************************************************************

// I've noticed that the background colour of all exmaples is either bg1 or bg2.
// untill further reaserch on the process of creating the PNGs, I'll leave it 
// this way.
var backGround1 = [192, 192, 192];
var backGround2 = [148, 148, 170];

// At the moment, the program scans the entire picture, pixel by pixel.
// this could be easly changed later on.

//TODO: play with - should be 8 extreme maximum.
var xJumps = 7;
var yJumps = 1;

// as mentioned above, these numbers seem to work for all examples given
// even though borders are thinner at some occasions, they never seem to surpess 3
// further research is needed

var leftBorder = 3;
var botBorder = 3;

// all exmaples given seem to have the same measurements
// once again - further research on picture formant is needed

var picWidth = 89;
var picHeight = 57;

// minimal height diffrence for non-stright lines
// once again, this fits for all examples given
var drawLineSensitivity = 0;

// ratio between units
var ratio = 2.85;

// demo regexs 
var URLDown = /resources\/Input_files_examples\/Ex\d.(png|jpeg)/;
//var QR = /QR .*/;
// resources/Input_files_examples/Ex5.png
var URLUp = "dev/demos";
// controls the slope of waves.
var slope = 3;
// server is currently running localy -> IP is local host.
var HOST = '127.0.0.1';
// server designated port -> currently just usually available random port, should
// be looked into
var PORT = 6969; // TCP LISTEN port

//var QRTop = "0\n"
//QRTop += "SECTION\n";
//QRTop += "2\n";
//QRTop += "HEADER\n";
//QRTop += "9\n";
//QRTop += "$ACADVER\n";
//QRTop += "1\n";
//QRTop += "AC1006\n";
//QRTop += "0\n";
//QRTop += "ENDSEC\n";
//QRTop += "0\n";
//QRTop += "SECTION\n";
//QRTop += "2\n";
//QRTop += "ENTITIES\n";
//
//var QRBottom = "0\n";
//QRBottom += "ENDSEC\n";
//QRBottom += "0\n";
//QRBottom += "EOF\n";
//
//
//// 1 before x1
//var solidI = "0\n"; 
//solidI += "SOLID\n";
//solidI += "8\n";
//solidI += "barcode\n";
//solidI += "10\n";
//// 1 insert x1
// 
//   
//// 2 before y1
//var solidII = "20\n";
//// 2 insert y1
// 
//// 3 before x2
//var solidIII = "30\n";
//solidIII += "0\n";
//solidIII += "11\n";
//// 3 insert x2
//
//// 4 before y2
//var solidIV = "21\n";
//// 4 insert y2
//
//// 5 before x3
//var solidV = "31\n";
//solidV += "0\n";
//solidV += "12\n";
//// 5 insert x3
//
//// 6 before y3
//var solidVI = "22\n";
//// 6 insert y3
//
//// 7 insert x4
//var solidVII = "32\n";
//solidVII += "0\n";
//solidVII += "13\n";
//// 7 insert x4
//
//// 8 before y4
//var solidVIII = "23\n";
//// 8 inesrt y4
//
//// 9 end of 1 solid
//var solidIX = "33\n";
//solidIX += "0\n";
// // 9 solid done


// -------------------------------server stuff----------------------------------
// -------------------------------server stuff----------------------------------
// -------------------------------server stuff----------------------------------

// server init 
var server = net.createServer(function (sock) {

    // whenever someone sends data to the server through socket.
    sock.on('data', function (data) {
        var pathIn = data.toString();
        theLineFucntion(pathIn , sock);
    });

    // whenever a socket is closed.
    sock.on('close', function (data) {
        // closed connection
        // console.log('CLOSED: ' + sock.remoteAddress +' '+ sock.remotePort);
    });

// start listening.
}).listen(PORT, HOST);

// TODO: proper error handling.
server.on('error', function (err) {
    console.log(err);
});

// TODO: proper Exception handling. as of now shuts server down
// on exception, so that port would be available next time.
process.on('uncaughtException', function () {
    server.close();
});

// TODO: proper shutdown handling. as of now shuts server down when terminated 
// by parent process 
process.on('SIGTERM', function () {
    server.close();
});

// Singal parent process that the service is up and ready excpecting requests. 
server.on('listening', function () {
    process.stdout.write("ready \n");
});







// -------------------------------LineFunction----------------------------------
// -------------------------------LineFunction----------------------------------
// -------------------------------LineFunction----------------------------------



/**
 * takes an a jpg or png file and creates a DXF based on it
 * @param {string} path -  path to the img
 * @returns {void} a DXF file
 */
function theLineFucntion(path , sock) {
    /**
     * this function manages the work flow once a soundwave image has been loaded
     * to the server
     * @param {err} err
     * @param {a 3Darray bitmap} pixels
     * @returns {void} eventually saves a new DXF file
     */
    // make sure no newline char in the input
    path = path.replace("\n", "");
    
    getPixels(path, function (err, pixels) {
        if (err) {
            console.log(err);
            return;
        }
        // console.log("got pixels", pixels.shape.slice());
        
        // we now have a 3Darray named pixels storing a bitmap. 
        // [width , height , channle]

        // determine and store the relevant background
        var backGround = (backGroundSetter(pixels)) ? backGround1 : backGround2;
        // console.log("BG is");
        // console.log(backGround);
        // create an array to contain the jeweleries ID 
        var ID = [];
        // create an array of points to connect on the output DXF 
        var points = pointsArraySetter(pixels, backGround, ID);
        // console.log(points.length);
        for (var i = 0; i < points.length; i++) {
            points[i].print();
        }
        // create path's array for makerJS
        var paths = pathsArraySetter(points);
        // create DXF formatted String
        var dxf = makerjs.exporter.toDXF(paths);
        // create the DXF file
        var dxfPath = createDXF(dxf, path);
        // create the ID TXT file
        var txtPath = createIDTXT(ID, path);
        
        console.log(dxfPath + " " + txtPath + " \n");
        sock.write(dxfPath + " " + txtPath + " \n");
    });

}
/**
 * this function recives a 3Darray bitmap and defines it's backGround colour
 * @param {type} bitmap the 3Darray
 * @returns {Boolean} true for backGround1, false for BackGounrd 2
 */
function backGroundSetter(bitmap) {
    // scan the highest row of our bitmap, checking for a pixel to match one
    // of our predefined background pixel options
    for (var x = 0; x < picWidth; x++) {
        var currentPixel = [bitmap.get(x, picHeight - 1, 0),
            bitmap.get(x, picHeight - 1, 1), bitmap.get(x, picHeight - 1, 2)];
        if (comparePixels(currentPixel, backGround1))
            return true;
    }
    return false;
}

/**
 * this funcitons checks if two pixels are identicale in color
 * @param {type} pixelA
 * @param {type} pixelB
 * @returns {Boolean} true if identical, else returns flase
 */
function comparePixels(pixelA, pixelB) {
    return ((Math.abs(pixelA[0] - pixelB[0]) < 5) &&
            (Math.abs(pixelA[1] - pixelB[1]) < 5) &&
            (Math.abs(pixelA[2] - pixelB[2]) < 5));


}
/**
 * an object representing a point.
 * @param {type} x
 * @param {type} y
 * @returns {point} a point with the given coordinates
 */
function point(x, y) {
    this.X = x;
    this.Y = y;
    this.print = function () {
        console.log("(" + this.X + "," + this.Y + ")");
    };
    this.array = [x, y];
}
/**
 * takes two values and decides which is farthest from the middle point
 * @param {number} lowerValue
 * @param {number} higerValue
 * @returns {number}
 */
function selectFarthestY(lowerValue, higerValue) {

    var mid = picHeight / 2;
    if (mid - lowerValue > Math.abs(higerValue - mid))
        return lowerValue;
    return higerValue;
}
/**
 * checks if Height diffrence between two points is sufficient
 * TODO : only create straight line on the X axis
 * @param {Point} lastPoint the last point drawn
 * @param {Point} currentPoint point to test
 * @returns {Boolean} true if height diffrence is insufficient
 */
function isInvalidLine(lastPoint, currentPoint) {
    return Math.abs(currentPoint.Y - lastPoint.Y) < drawLineSensitivity;
}
/**
 * this function analyzes the bitmap and finds all extreme Points
 * @param {3Darray} bitmap the bitmap
 * @param {array} backGround an array representing a background pixel
 * @returns {an array of points}
 */
function pointsArraySetter(bitmap, backGround, ID) {
    var Points = [];
    // create the striaght line at the begging
    Points.push(new point(0, 10));
    Points.push(new point(1.25, 10));

    for (var i = 0; i < 11; i++) {

        var aPoint;
        if (i % 2 == 0) {
            aPoint = getMinPoint(i, backGround, bitmap, ID);
        } else {
            aPoint = getMaxPoint(i, backGround, bitmap, ID);
        }
        Points.push(aPoint);
    }
    Points.push(new point(30.25, 10));
    Points.push(new point(31.5, 10));


    return Points;

}

function getMinPoint(i, background, bitmap, ID) {
    var x = leftBorder + (i * xJumps);
    var pointsY = 28;
    for (var y = 28; y > botBorder; y -= yJumps) {
        var current = [bitmap.get(x, y, 0), bitmap.get(x, y, 1), bitmap.get(x, y, 2)];
        console.log(current);
        if (!comparePixels(current, background)) {
            pointsY = y;
        } else {
            break;
        }
    }
    ID.push(pointsY);
    console.log(pointsY);
    x /= ratio;
    pointsY /= ratio;
    x += 2.2;
    return new point(x, pointsY);
}

function getMaxPoint(i, background, bitmap, ID) {
    var x = leftBorder + (i * xJumps);
    var pointsY = 28;
    for (var y = 28; y < picHeight; y += yJumps) {
        var current = [bitmap.get(x, y, 0), bitmap.get(x, y, 1), bitmap.get(x, y, 2)];
        console.log(current);
        if (!comparePixels(current, background)) {
            pointsY = y;
        } else {
            break;
        }
    }
    ID.push(pointsY);
    console.log(pointsY);
    x /= ratio;
    pointsY /= ratio;
    x += 2.2;
    return new point(x, pointsY);

}
/**
 * creates an array filled with objects suited for makerJS
 * @param {type} points array of points 
 * @returns {undefined} an array of entities
 */
function pathsArraySetter(points) {

    var paths = [];
    for (var i = 0; i < points.length - 1; i++) {

        var d = Math.abs(points[i + 1].X - points[i].X) / slope;
        var controlPointI = new point(points[i].X + d, points[i].Y);
        var controlPointII = new point(points[i + 1].X - d, points[i + 1].Y);
        console.log(i);
        paths.push(new makerjs.models.BezierCurve([points[i].array, controlPointI.array, controlPointII.array, points[i + 1].array]));
    }
//    for (var i = 0 ; i < points.length - 1 ; i++){
//        paths.push(new makerjs.paths.Line(points[i].array, points[i+1].array));
//    }
    return paths;
}
/**
 * creates a DXF file
 * @param {String} dxf String to write
 * @returns {void}
 */
function createDXF(dxf, path) {
    var name = path.substring(path.lastIndexOf("/"), path.length - 3) + "dxf";
    name = name.replace('j', '');
    name = __dirname + "/output" + name;
    fs.writeFile(name, dxf, function (err) {
        if (err) {
            return console.log(err);
        }
    });
    return name;
}

function createIDTXT(ID, path) {
    var name = path.substring(path.lastIndexOf("/"), path.length - 3) + "txt";
    name = name.replace('j', '');
    name = __dirname + "/output" + name;
    var IDString = "";
    for (var i = 0; i < ID.length; i++) {
        IDString += ID[i];
        IDString += " ";
    }
    fs.writeFile(name, IDString, function (err) {
        if (err) {
            return console.log(err);
        }

    });
    return name;
}








// -----------------------------QR CODE FUNCTION------------------------------------
// -----------------------------QR CODE FUNCTION------------------------------------
// -----------------------------QR CODE FUNCTION------------------------------------


//function theQRFunction(path){
//    path = path.substring(3);
//    var qr = qrCode.qrcode(1);
//    qr.addData(path);
//    qr.make();
//    
//
//    var QRImg = qr.createImgTag(4);    // creates an <img> tag as text
//    console.log(QRImg);
////    var first = QRImg.indexOf("\"");
////    var last = QRImg.indexOf("\"" , first + 1);
////    var img = QRImg.substring(first + 1, last);
////    getPixels(img , function(err, pixels) {
////        if (err) {
////           console.log("Bad image path");
////           return;
////        }
////        console.log("got pixels", pixels.shape.slice());
////        
////        var QRString = createQRString(pixels);
////            getPixels(path, function(err, pixels) {
////            if (err) {
////                console.log("Bad image path");
////                return;
////            }
////            console.log("got pixels", pixels.shape.slice());
////
////
////        });
////        createQRDXF(QRString, path);
////        
////    });
//
//}
//
///**
// * creates a String containing the entire DXF DATA
// */
//function createQRString(bitmap){
//    var QRString = QRTop;
//    for ( var x = 0 ; x < 116 ; x ++){
//        for ( var y = 0 ; y < 116 ; y++) {
//            if(bitmap.get(0,x,y,0) == 255){
//                QRString += createSolid(x,y);
//            }
//        }
//    }
//    QRString += QRBottom;
//    return QRString;
//    
//}
///**
// * creates a solid DXF entity
// */
//function createSolid(x,y){
//    y = -y;
//    var x1 = x;
//    x1 += "\n";
//    var y1 = y;
//    y1 += "\n";
//    var x2 = x+1;
//    x2 += "\n";
//    var y2 = y;
//    y2 += "\n";
//    var x3 = x;
//    x3 += "\n";
//    var y3 = y+1;
//    y3 += "\n";
//    var x4 = x2;
//    var y4 = y3;
//
//    var solid = solidI;
//    solid += x1;
//    solid += solidII;
//    solid += y1;
//    solid += solidIII;
//    solid += x2;
//    solid += solidIV;
//    solid += y2;
//    solid += solidV;
//    solid += x3;
//    solid += solidVI;
//    solid += y3;
//    solid += solidVII;
//    solid += x4;
//    solid += solidVIII;
//    solid += y4;
//    solid += solidIX; 
//    return solid;
//}
//
//function createQRDXF(dxf, path){
//    var name = URLUp + path + ".dxf"; 
//    fs.writeFile(name, dxf, function(err) {
//    if(err) {
//        return console.log(err);
//    }
//
//    console.log("The file was saved at " + name );
//}); 
//}

