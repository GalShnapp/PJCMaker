/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//
//// write spline entity
//var k;
//dxf.writeSpline(writer,
//    DL_SplineData(degreeOfSpline,
//                      numKnots,
//                      numCtrl,
//                      flags),
//        attributes);
//
//// write spline knots (example, might vary in your case):
//int k = degreeOfSpline +1;
//DL_KnotData kd;
//for (var i=1; i<=numKnots; i++) {
//        if (i<=k) {
//            kd = DL_KnotData(0.0);
//        } else if (i<=numKnots-k) {
//            kd = DL_KnotData(1.0/(numKnots-2*k+1) * (i-k));
//        } else {
//            kd = DL_KnotData(1.0);
//        }
//        dxf.writeKnot(writer, kd);
//}
//
//// write spline control points (numCtrl control points):
//dxf.writeControlPoint(writer, DL_ControlPointData(x, y, z));
//dxf.writeControlPoint(writer, DL_ControlPointData(x, y, z));

var makerjs = require('makerjs');



//BezierCurve parameters: points
function point(x, y) {
    this.X = x;
    this.Y = y;
    this.print = function () {
        console.log("(" + this.X + "," + this.Y + ")");
    };
    this.array = [x,y];
}
var min = new point(3.2526315789473683,8.771929824561402);
var max = new point(5.708771929824561,12.280701754385964);
var d = Math.abs(max.X - min.X);
d /= 5;
var minD = new point(3.2526315789473683 + d,8.771929824561402);
var maxD = new point(5.708771929824561 - d,12.280701754385964);

var myBezierCurve = new makerjs.models.BezierCurve([ min.array, minD.array , maxD.array , max.array ]);
var dxf = makerjs.exporter.toDXF(myBezierCurve);
console.log(dxf);

min = max;
max = new point(8.164912280701754 ,6.666666666666666);
var d = Math.abs(max.X - min.X);
d /= 5;
minD = new point(5.708771929824561 + d , 12.280701754385964);
maxD = new point(8.164912280701754 - d , 6.666666666666666);

myBezierCurve = new makerjs.models.BezierCurve([ min.array, minD.array , maxD.array , max.array ]);
dxf = makerjs.exporter.toDXF(myBezierCurve);
console.log(dxf);