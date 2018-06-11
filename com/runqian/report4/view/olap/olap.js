
function rq_mousedown(div) {
	if (event.button != 1) {
		return;
	}
	var o = rq_getDragSource(event.srcElement);
	if (o != null && o != div) {
		o.dragDrop();
		event.returnValue = false;
		event.cancelBubble = true;
	}
}
function rq_getCood(obj) {
	var x = obj.offsetLeft;
	var y = obj.offsetTop;
	var obj = obj.offsetParent;
	while (obj.tagName != "BODY") {
		x += obj.offsetLeft + obj.clientLeft;
		y += obj.offsetTop + obj.clientTop;
		obj = obj.offsetParent;
	}
	return new Array(x, y);
}

//div是整个olap区域
function rq_dragstart(div) {
	var o = rq_getDragSource(event.srcElement);
	if (o == null || o == div) {
		event.returnValue = false;
		return;
	}
	div.ondragend = new Function("rq_dragend(this);");
	div.ondragenter = new Function("rq_dragenter(this);");
	div.ondragover = new Function("rq_dragover(this);");
	div.ondragleave = new Function("rq_dragleave(this);");
	div.ondrop = new Function("rq_drop(this);");
	if (o.getAttribute("tips") != null) {
		var tip = document.getElementById("dragTip_" + div.id);
		tip.innerText = o.getAttribute("tips");
		div.dragTip = tip;
		rq_displayTip(div);
	} else {
		div.dragTip = null;
	}
	div.dragSrc = o;
	event.dataTransfer.setData("Text", "");
	event.dataTransfer.effectAllowed = "move";
}
function rq_getDragSource(o) {
	for (var p = o; p != null; p = p.parentElement) {
		var a = p.getAttribute("dds");
		if (a != null && a.length > 0) {
			return p;
		}
	}
	return null;
}
function rq_displayTip(div) {
	var tip = div.dragTip;
	if (tip != null) {
		var C = rq_getCood(div);
		var c = rq_getCood(event.srcElement);
		var y = event.offsetY;
		var x = event.offsetX;
		x = x + c[0];
		y = y + c[1];
		var pdiv = event.srcElement;
		while (pdiv.tagName != "DIV") {
			pdiv = pdiv.parentElement;
		}
		if (pdiv.id) {
			if (pdiv.id.indexOf("_topdiv") > 0 || pdiv.id.indexOf("_leftdiv") > 0 || pdiv.id.indexOf("_contentdiv") > 0) {
				x -= pdiv.scrollLeft;
				y -= pdiv.scrollTop;
			}
		}
		if (y < C[1] || x < C[0] || y > C[1] + div.offsetHeight || x > C[0] + div.offsetWidth) {
			tip.style.display = "none";
		} else {
			tip.style.display = "";
			tip.style.top = y + 10;
			tip.style.left = x + 15;
		}
	}
}
function rq_dragenter(div) {
	if (div.dragSrc == null) {
		return;
	}
	var mark = document.getElementById("dropMark_" + div.id);
	if (event.srcElement == mark) {
		event.dataTransfer.dropEffect = "move";
		event.returnValue = false;
		return;
	}
	var dt = rq_getDropTarget(event.srcElement);
	if (dt == null || dt == div) {
		rq_hideDropMark(mark);
		return;
	}
	div.dropTarget = dt;
	rq_showDropMark(div, dt, mark);
	event.returnValue = false;
	event.dataTransfer.dropEffect = "move";
}
function rq_getDropTarget(o) {
	for (var p = o; p != null; p = p.parentElement) {
		var a = p.getAttribute("dds");
		if (a != null) {
			return p;
		}
	}
	return null;
}
function rq_showDropMark(div, dt, mark) {
	if (dt == null || dt == div) {
		return;
	}
	var t = dt.parentElement;
	while (t.tagName != "TABLE") {
		t = t.parentElement;
	}
	var tc = rq_getCood(t);
	var type = dt.getAttribute("ddtype");
	var dds = dt.getAttribute("dds");
	var src = event.srcElement;
	var c = rq_getCood(src);
	if (type == "1") {   //添加到列
		var topDiv = document.getElementById(div.id + "_topdiv");
		var w = t.offsetWidth;
		var w1 = topDiv.offsetWidth;
		w = w > w1 ? w1 : w;
		mark.style.width = w;
		mark.style.height = 4;
		mark.style.left = tc[0];
		if (src.offsetHeight / 2 > event.offsetY) {   //在前插入
			dt.insPos = "q";
			mark.style.top = c[1] - 2;
		} else {
			dt.insPos = "h";
			mark.style.top = c[1] + src.offsetHeight - 2;
		}
	} else {
		if (type == "2") {   //添加到行
			var leftDiv = document.getElementById(div.id + "_leftdiv");
			var h = t.offsetHeight;
			var h1 = leftDiv.offsetHeight;
			h = h > h1 ? h1 : h;
			mark.style.height = h;
			mark.style.width = 4;
			mark.style.top = tc[1];
			if (src.offsetWidth / 2 > event.offsetX) {   //在前插入
				dt.insPos = "q";
				mark.style.left = c[0] - 2;
			} else {
				dt.insPos = "h";
				mark.style.left = c[0] + src.offsetWidth - 2;
			}
		} else {
			if (type == "3") {   //添加到维列表
				mark.style.width = t.offsetWidth;
				mark.style.height = 4;
				mark.style.left = tc[0];
				if (dds.length > 0) {   //在维上
					if (src.offsetHeight / 2 > event.offsetY) {   //在前插入
						dt.insPos = "q";
						mark.style.top = c[1] - 2;
					} else {
						dt.insPos = "h";
						mark.style.top = c[1] + src.offsetHeight - 2;
					}
				} else {  //在可选维标题上
					mark.style.top = c[1] + src.offsetHeight - 2;
				}
			}
		}
	}
	mark.style.display = "";
}
function rq_hideDropMark(mark) {
	mark.style.display = "none";
}
function rq_dragover(div) {
	if (div.dragSrc == null) {
		return;
	}
	rq_displayTip(div);
	var mark = document.getElementById("dropMark_" + div.id);
	if (event.srcElement == mark) {
		event.dataTransfer.dropEffect = "move";
		event.returnValue = false;
		return;
	}
	var dt = rq_getDropTarget(event.srcElement);
	rq_showDropMark(div, dt, mark);
	if (dt == null) {
		event.dataTransfer.dropEffect = "none";
	} else {
		event.dataTransfer.dropEffect = "move";
	}
	event.returnValue = false;
}
function rq_dragend(div) {
	if (div.dragTip != null) {
		div.dragTip.style.display = "none";
	}
	rq_hideDropMark(document.getElementById("dropMark_" + div.id));
	div.dragSrc = null;
	div.dropTarget = null;
	div.ondragend = null;
	div.ondragenter = null;
	div.ondragover = null;
	div.ondragleave = null;
	div.ondrop = null;
}
function rq_dragleave(div) {
	rq_hideDropMark(document.getElementById("dropMark_" + div.id));
}
function rq_drop(div) {
	var src = div.dragSrc;
	var t = div.dropTarget;
	if (src == null || t == null) {
		return;
	}
	if (src == t) {
		return;
	}
	var sdds = src.getAttribute("dds");
	var tdds = t.getAttribute("dds");
	if (sdds == tdds) {
		return;
	}
	var st = src.getAttribute("ddtype");
	var tt = t.getAttribute("ddtype");
	var olap = eval(div.id + "_olap");
	if (st == "1") {
		var dims = olap.colDims;
		if (tt == "1") {
			dims = rq_removeItem(dims, sdds);
			dims = rq_insItem(dims, tdds, sdds, t.insPos);
			if (dims == olap.colDims) {
				return;
			}
			olap.colDims = dims;
			rq_expandDim(tdds, t.getAttribute("value"), olap);
			rq_setExpandAll(div);
			rq_requestOlap(div);
			return;
		} else {
			if (tt == "2") {
				var rdims = olap.rowDims;
				dims = rq_removeItem(dims, sdds);
				rdims = rq_insItem(rdims, tdds, sdds, t.insPos);
				rq_expandDim(tdds, t.getAttribute("value"), olap);
				olap.colDims = dims;
				olap.rowDims = rdims;
				rq_setExpandAll(div);
				rq_requestOlap(div);
				return;
			} else {
				if (tt == "3") {
					dims = rq_removeItem(dims, sdds);
					olap.colDims = dims;
					rq_requestOlap(div);
					return;
				}
			}
		}
	} else {
		if (st == "2") {
			var dims = olap.rowDims;
			if (tt == "1") {
				var cdims = olap.colDims;
				dims = rq_removeItem(dims, sdds);
				cdims = rq_insItem(cdims, tdds, sdds, t.insPos);
				rq_expandDim(tdds, t.getAttribute("value"), olap);
				olap.colDims = cdims;
				olap.rowDims = dims;
				rq_setExpandAll(div);
				rq_requestOlap(div);
				return;
			} else {
				if (tt == "2") {
					dims = rq_removeItem(dims, sdds);
					dims = rq_insItem(dims, tdds, sdds, t.insPos);
					if (dims == olap.rowDims) {
						return;
					}
					rq_expandDim(tdds, t.getAttribute("value"), olap);
					olap.rowDims = dims;
					rq_setExpandAll(div);
					rq_requestOlap(div);
					return;
				} else {
					if (tt == "3") {
						dims = rq_removeItem(dims, sdds);
						olap.rowDims = dims;
						rq_requestOlap(div);
						return;
					}
				}
			}
		} else {
			if (st == "3") {
				if (tt == "1") {
					var cdims = olap.colDims;
					cdims = rq_insItem(cdims, tdds, sdds, t.insPos);
					rq_expandDim(tdds, t.getAttribute("value"), olap);
					olap.colDims = cdims;
					rq_setExpandAll(div);
					rq_requestOlap(div);
					return;
				} else {
					if (tt == "2") {
						var rdims = olap.rowDims;
						rdims = rq_insItem(rdims, tdds, sdds, t.insPos);
						rq_expandDim(tdds, t.getAttribute("value"), olap);
						olap.rowDims = rdims;
						rq_setExpandAll(div);
						rq_requestOlap(div);
						return;
					}
				}
			}
		}
	}
}
function rq_setExpandAll( div ) {
	var form = document.getElementById(div.id + "_form");
	form.expandAll.value = "1";
}
function rq_removeItem(s1, s2) {
	if (s1 == "") {
		return "";
	}
	var a = s1.split(",");
	for (var i = 0; i < a.length; i++) {
		if (s2 == a[i]) {
			a.splice(i, 1);
			break;
		}
	}
	var s = "";
	for (var i = 0; i < a.length; i++) {
		if (s.length > 0) {
			s += ",";
		}
		s += a[i];
	}
	return s;
}
function rq_insItem(s1, s2, s3, flag) {
	if (s1 == "") {
		return s3;
	}
	if (s2 == "") {
		if (flag == "q") {
			s1 = s3 + "," + s1;
		} else {
			s1 += "," + s3;
		}
	} else {
		s1 = "," + s1 + ",";
		var s4 = "," + s2 + ",";
		var pos = s1.indexOf(s4);
		if (pos >= 0) {
			if (flag == "q") {
				s1 = s1.substring(0, pos) + "," + s3 + s1.substring(pos);
			} else {
				pos += s4.length;
				s1 = s1.substring(0, pos) + s3 + "," + s1.substring(pos);
			}
		}
		s1 = s1.substring(1);
		s1 = s1.substring(0, s1.length - 1);
	}
	return s1;
}
function rq_expandDim(dim, value, olap) {
	if (dim == "" || dim == null) {
		return;
	}
	if (value == null || value == "") {
		return;
	}
	var s = olap.expandInfo;
	if (s == "") {
		s = dim + "," + value;
	} else {
		if ((";" + s + ";").indexOf(";" + dim + "," + value + ";") < 0) {
			s += ";" + dim + "," + value;
		}
	}
	olap.expandInfo = s;
}
var rq_onloadMethods = new Array();
var rq_onloadTimer = setInterval("rq_executeOnloadMethods()", 200);
function rq_addOnloadMethod(m) {
	rq_onloadMethods[rq_onloadMethods.length] = m;
}
function rq_executeOnloadMethods() {
	if (document.readyState == "complete") {
		clearInterval(rq_onloadTimer);
		if (rq_onloadMethods.length == 0) {
			return;
		}
		for (var i = 0; i < rq_onloadMethods.length; ) {
			var m = rq_onloadMethods[i];
			rq_onloadMethods.splice(i, 1);
			eval(m);
		}
	}
}
function rq_initOlapSize(divName) {
	var div = document.getElementById(divName);
	var W = div.clientWidth;
	var H = div.clientHeight;
        var __W = -1;
        var __H = -1;
	if ( W == 0 ){
               __W = W;
               W = document.getElementById( divName + "_dimTitle" ).offsetWidth  +
                   document.getElementById( divName + "_topdiv" ).offsetWidth  +
                   document.getElementById( divName + "_corner" ).offsetWidth ;
	}
	if ( H == 0 ){
               __H = H;
               H = document.getElementById( divName + "_contentdiv" ).offsetHeight +
                   document.getElementById( divName + "_topdiv" ).offsetHeight ;
        }

	var dimTitle = document.getElementById(divName + "_dimTitle");
	var dimListTbl = document.getElementById(divName + "_dimListTbl");
	if (dimListTbl != null) {
		var dimW = dimTitle.offsetWidth;
		var dimW1 = dimListTbl.offsetWidth;
		if (dimW > dimW1) {
			dimListTbl.style.width = dimW;
		} else {
			dimTitle.style.width = dimW1;
		}
	}
	var title = document.getElementById(divName + "_title");
	var dimDiv = document.getElementById(divName + "_dimList");
	var dimDivH = H - dimTitle.offsetHeight;
	if (title != null) {
		dimDivH -= title.offsetHeight;
	}
        if ( __W != 0 || __H !=0 ){  ///////////////////////////////////////////////////////
	    dimDiv.style.height = dimDivH;
	    dimDiv.style.width = dimTitle.offsetWidth;
            dimTitle.parentElement.style.width = dimTitle.offsetWidth;
        }

	var contentTbl = document.getElementById(divName + "_content");
	var topTbl = document.getElementById(divName + "_top");
	var leftTbl = document.getElementById(divName + "_left");
	var cornerTbl = document.getElementById(divName + "_corner");
	var row = contentTbl.rows[0];
	var contentTblW = 0;
	for (var c = 0; c < row.cells.length; c++) {
		var topCell = document.getElementById(divName + "_topcol" + c);
		var w1 = topCell.offsetWidth;
		topCell.initWidth = w1;
	}
	for (var c = 0; c < row.cells.length; c++) {
		var cell = row.cells[c];
		var w = cell.offsetWidth;
		var topCell = document.getElementById(divName + "_topcol" + c);//rq_lookupTopCell( topTbl, c );
		var w1 = topCell.initWidth;
		//alert( w1 );
		if (w > w1) {
			topCell.style.width = w;
			cell.style.width = w;
			contentTblW += w;
		} else {
			cell.style.width = w1;
			topCell.style.width = w1;
			contentTblW += w1;
		}
	}
        if ( __W != 0 || __H !=0 ){  /////////////////////////////////////////////////////
            topTbl.style.width = contentTblW;
        }
        contentTbl.style.width = contentTblW;
        cornerTbl.style.height = topTbl.offsetHeight;

	var cw = cornerTbl.offsetWidth;
	var lw = leftTbl.offsetWidth;
	var cornerCol = document.getElementById(divName + "_cornerCol");
	if (cw > lw) {
		cornerCol.style.width = cw - 8;
		cornerTbl.style.width = cw;
		leftTbl.style.width = cw;
	} else {
		cornerCol.style.width = lw - 8;
		cornerTbl.style.width = lw;
		leftTbl.style.width = lw;
	}
	for (var c = 0; ; c++) {
		var leftCol = document.getElementById(divName + "_leftcol" + c);
		if (leftCol == null) {
			break;
		}
		var leftColW = leftCol.offsetWidth - 8;
		if (leftColW < 0) {
			leftColW = 0;
		}
		leftCol.style.width = leftColW;
	}
        if ( __W != 0 || __H !=0 ){  /////////////////////////////////////////////////////
                leftTbl.style.width = leftTbl.offsetWidth;
        }

	for (var r = 0; r < contentTbl.rows.length; r++) {
		row = contentTbl.rows[r];
		var leftRow = leftTbl.rows[r];
		var h = row.offsetHeight;
		var h1 = leftRow.offsetHeight;
		if (h > h1) {
			leftRow.style.height = h;
			row.style.height = h;
		} else {
			row.style.height = h1;
			leftRow.style.height = h1;
		}
	}
	topTbl.style.tableLayout = "fixed";
	leftTbl.style.tableLayout = "fixed";
	contentTbl.style.tableLayout = "fixed";
	cornerTbl.style.tableLayout = "fixed";
	var mainW = W - dimTitle.parentElement.offsetWidth;
	var mainH = H;
	if (title != null) {
		mainH -= title.offsetHeight;
	}
	var contentW = contentTbl.offsetWidth;
	var contentH = contentTbl.offsetHeight;
	var contentDiv = document.getElementById(divName + "_contentdiv");
	var topDiv = document.getElementById(divName + "_topdiv");
	var leftDiv = document.getElementById(divName + "_leftdiv");
	var leftW = leftDiv.offsetWidth;
	var topH = topDiv.offsetHeight;
	var topW = mainW - leftW;
	if (mainH - topH < contentH) {
		topW -= 16;
	}
	if (topW < 0) {
		topW = 0;
	}
        if ( __W != 0 || __H !=0 ){  /////////////////////////////////////////////////////
                topDiv.style.width = topW;
        }

	var leftH = mainH - topH;
	if (mainW - leftW < contentW) {
		leftH -= 16;
	}
	if (leftH < 0) {
		leftH = 0;
	}
        if ( __W != 0 || __H !=0 ){  /////////////////////////////////////////////////////
               leftDiv.style.height = leftH;
        }

	var cw = mainW - leftW < 0 ? 0 : mainW - leftW;
        if ( __W != 0 || __H !=0 ){  /////////////////////////////////////////////////////
                contentDiv.style.width = cw;
                contentDiv.style.height = mainH - topH < 0 ? 0 : mainH - topH;
        }
}
function RQOlap(exp, field) {
	this.exp = exp;
	this.field = field;
	this.rowDims = "";
	this.colDims = "";
	this.hideInfo = "";
	this.expandInfo = "";
	this.dimValues = "";
}
function rq_doubleClick(div) {
	var src = event.srcElement;
	while (src.tagName != "TD") {
		src = src.parentElement;
	}
	var olap = eval(div.id + "_olap");
	var expand = src.getAttribute("expand");
	if (expand != null) {
		var dimName = src.getAttribute("dds");
		var value = src.getAttribute("value");
		if (expand == "0") {
			if (olap.expandInfo.length > 0) {
				olap.expandInfo += ";";
			}
			olap.expandInfo += dimName + "," + value;
			rq_requestOlap(div);
			return;
		} else {
			olap.expandInfo = rq_rmDimValue(olap.expandInfo, dimName, value);
			rq_requestOlap(div);
			return;
		}
	} else {
		if (src.getAttribute("isCorner") == 1) {
			rq_showExpMenu(div, src);
		} else {
			var rowNo = src.getAttribute("rowNo");
			var colNo = src.getAttribute("colNo");
			if (rowNo != null && colNo != null) {
				var form = document.getElementById(div.id + "_detailform");
				form.action.value = "19";
				form.olap_expandInfo.value = olap.expandInfo;
				form.olap_hideInfo.value = olap.hideInfo;
				form.olap_rowDims.value = olap.rowDims;
				form.olap_colDims.value = olap.colDims;
				form.rowNo.value = rowNo;
				form.colNo.value = colNo;
				form.submit();
			}
		}
	}
}
function rq_rmDimValue(s, dim, value) {
	var tmp = s.split(";");
	for (var i = 0; i < tmp.length; i++) {
		if (dim + "," + value == tmp[i]) {
			tmp.splice(i, 1);
			break;
		}
	}
	var s = "";
	for (var i = 0; i < tmp.length; i++) {
		if (s.length > 0) {
			s += ";";
		}
		s += tmp[i];
	}
	return s;
}
function rq_requestOlap(div) {
	var mb = document.getElementById(div.id + "_mengban");
	var c = rq_getCood(div);
	mb.style.left = c[0];
	mb.style.top = c[1];
	mb.style.width = div.offsetWidth;
	mb.style.height = div.offsetHeight;
	mb.style.paddingTop = div.offsetHeight / 2;
	mb.style.display = "";
	var form = document.getElementById(div.id + "_form");
	var olap = eval(div.id + "_olap");
	form.olap_exp.value = olap.exp;
	form.olap_field.value = olap.field;
	form.olap_rowDims.value = olap.rowDims;
	form.olap_colDims.value = olap.colDims;
	form.olap_expandInfo.value = olap.expandInfo;
	form.olap_hideInfo.value = olap.hideInfo;
	form.submit();
}
function rq_olapScroll(name) {
	var contentDiv = document.getElementById(name + "_contentdiv");
	var topDiv = document.getElementById(name + "_topdiv");
	topDiv.scrollLeft = contentDiv.scrollLeft;
	var leftDiv = document.getElementById(name + "_leftdiv");
	leftDiv.scrollTop = contentDiv.scrollTop;
}
function rq_contextMenu(div) {
	var src = event.srcElement;
	if (src.getAttribute("isCorner") == 1) {
		rq_showExpMenu(div, src);
	} else {
		if (src.tagName == "NOBR") {
			src = src.parentElement;
		}
		var dim = src.getAttribute("dds");
		var ddtype = src.getAttribute("ddtype");
		if (dim != null && dim != "" && ddtype != "3") {
			rq_showHideValuesMenu(div, src, dim);
		}
	}
	return false;
}
function rq_showExpMenu(div, src) {
	var noexp = div.noExpMenu;
	if( noexp != null ) return;
	var menu = document.getElementById(div.id + "_expmenu");
	var c = rq_getCood(src);
	menu.style.top = c[1] + event.offsetY + 10;
	menu.style.left = c[0] + event.offsetX + 10;
	menu.style.display = "";
}
function rq_hideExpMenu(divName) {
	var menu = document.getElementById(divName + "_expmenu");
	menu.style.display = "none";
}
function rq_statisticChanged(divName) {
	rq_hideExpMenu(divName);
	var div = document.getElementById(divName);
	var box = document.getElementById(divName + "_expbox");
	var cols = eval(divName + "_expcol");
	var col = "";
	if (cols.length) {
		for (var i = 0; i < cols.length; i++) {
			if (cols[i].checked) {
				col = cols[i].getAttribute("value");
				break;
			}
		}
	} else {
		col = cols.getAttribute("value");
	}
	var olap = eval(divName + "_olap");
	if (olap.exp.toLowerCase() == box.value && olap.field == col) {
		return;
	}
	olap.exp = box.value;
	olap.field = col;
	rq_requestOlap(div);
}
function rq_showHideValuesMenu(div, src, dim) {
	var menu = document.getElementById(div.id + "_hidevaluesmenu");
	var olap = eval(div.id + "_olap");
	var list;
	var values = olap.dimValues.split(";");

	for (var i = 0; i < values.length; i++) {
		list = values[i].split(",");
		if (list[0] == dim) {
			break;
		}
	}
	var s = "<table cellSpacing=0 cellPadding=2 border=0>";
	var valueCount = list.length - 1;
	if( valueCount <= 10 ) { 
		for (var i = 1; i < list.length; i++) {
			var value = list[i];
	        var real;
	        var dis;
	        if(value.indexOf(":")>0){
	           	var tmps=value.split(":");
	            real=tmps[0];
	            dis=tmps[1];
	        }
	        else{
	        	real=value;
	            dis=value;
	       	}
			s += "<tr><td style=\"font-size:12px\"><input type=checkbox value=\""+real+"\" style=\"vertical-align:middle\"";
			if ((";" + olap.hideInfo + ";").indexOf(";" + dim + "," + real + ";") < 0) {
				s += " checked";
			}
			s += ">" + dis + "</td></tr>";
		}
	}
	else {
		var lie = ( valueCount - 1 ) / 10 + 1;
		for( var k = 1; k <= 10; k++ ) {
			s += "<tr>";
			for( var i = 0; i < lie; i++) {
				var index = i * 10 + k;
		        var real = "";
		        var dis = "";
		        if( index < list.length ) {
					var value = list[index];
			        if(value.indexOf(":")>0){
			           	var tmps=value.split(":");
			            real=tmps[0];
			            dis=tmps[1];
			        }
			        else{
			        	real=value;
			            dis=value;
			       	}
			    }
			    if( real.length > 0 ) {
					s += "<td style=\"font-size:12px\"><input type=checkbox value=\""+real+"\" style=\"vertical-align:middle\"";
					if ((";" + olap.hideInfo + ";").indexOf(";" + dim + "," + real + ";") < 0) {
						s += " checked";
					}
					s += ">" + dis + "</td>";
				}
				else s += "<td></td>";
			}
			s += "</tr>";
		}
	}
	s += "</table>";

	menu.childNodes[0].outerHTML = s;
	menu.dim = dim;
	var c = rq_getCood(src);
	var x = c[0] + event.offsetX;
	var y = c[1] + event.offsetY;
	var pdiv = src;
	while (pdiv.tagName != "DIV") {
		pdiv = pdiv.parentElement;
	}
	if (pdiv.id) {
		x -= pdiv.scrollLeft;
		y -= pdiv.scrollTop;
	}
	menu.style.top = y + 10;
	menu.style.left = x + 10;
	menu.style.display = "";
}

function rq_hideValuesMenu(divName) {
	var menu = document.getElementById(divName + "_hidevaluesmenu");
	menu.style.display = "none";
}
function rq_hideValuesChanged(divName) {
	rq_hideValuesMenu(divName);
	var menu = document.getElementById(divName + "_hidevaluesmenu");
	var dim = menu.dim;
	var olap = eval(divName + "_olap");
	var table = menu.childNodes[0];
	for (var i = 0; i < table.rows.length; i++) {
		var row = table.rows[i];
		for( var j = 0; j < row.cells.length; j++ ) {
			var cell = row.cells[j];
			var box = cell.childNodes[0];
			if( box == null ) continue;
	        var value = box.value;
			if (box.checked) {
				olap.hideInfo = rq_rmDimValue(olap.hideInfo, dim, value);
			} else {
				if ((";" + olap.hideInfo + ";").indexOf(";" + dim + "," + value + ";") < 0) {
					if (olap.hideInfo.length > 0) {
						olap.hideInfo += ";";
					}
					olap.hideInfo += dim + "," + value;
				}
			}
		}
	}
	rq_requestOlap(document.getElementById(divName));
}
function rq_showGraph(divName, type) {
	var form = document.getElementById(divName + "_detailform");
	var olap = eval(divName + "_olap");
	form.action.value = "20";
	form.olap_expandInfo.value = olap.expandInfo;
	form.olap_hideInfo.value = olap.hideInfo;
	form.olap_rowDims.value = olap.rowDims;
	form.olap_colDims.value = olap.colDims;
	form.olap_exp.value = olap.exp;
	form.olap_field.value = olap.field;
	form.graphType.value = type;
	window.open( "", "RQGraphWin", "left=" + (window.screen.availWidth-10-800)/2 + ",top=" + (window.screen.availHeight-30-600)/2 + ", height=600, width=800, status=no, resizable=no" );
	form.target = "RQGraphWin";
	form.submit();
}

//以下为导出excel
  	  function generateSizeXML( _name ){
  	  		var xml = "<size colWidth=" + '"';
	  	  	for (var c = 0; ; c++) {
							 var leftCol = document.getElementById(_name + "_leftcol" + c);
						   if (leftCol == null) {
							     break;
						   }
						   var width =  leftCol.currentStyle.width ;
						   xml = xml  + width + ",";
					}

	    	  var content = document.getElementById( _name + "_content" );
	    	  var firstRow = content.rows[ 0 ] ;
	    	  var realCol = firstRow.cells.length;

					for ( var i = 0 ; i < realCol  ; i++ ) {
							 var cell = firstRow.cells[ i ];
							 var cellCurrentStyle = cell.currentStyle;
							 var width  = cellCurrentStyle.width;
							 xml = xml  + width ;
							 if ( i + 1 != realCol ) xml = xml + ",";
							 if ( i + 1 == realCol ) xml = xml + '"';
					}

					xml = xml + "  rowHeight=" + '"';


					var title = document.getElementById( _name + "_title" );
					if( title != null ) {
						var titleStyle = title.currentStyle;
				  		var titleRowHeight = titleStyle.height;
						xml = xml + titleRowHeight + ",";
					}
					else xml = xml + "0,";

					var top = document.getElementById( _name + "_top" );
					var topRowCount = top.rows.length;
					for ( var i = 0 ; i < topRowCount ; i ++ ){
						   var topRow = top.rows[ i ]	;
						   var topStyle = topRow.currentStyle;
						   var topRowHeight = topStyle.height;
							 xml = xml + topRowHeight + ",";
					}

					var contentRowCount = content.rows.length;
					for ( var i = 0 ; i < contentRowCount ; i ++ ){
							 var contentRow = content.rows[ i ]	;
							 var contentStyle = contentRow.currentStyle;
							 var contentRowHeight = contentStyle.height;
							 if ( i + 1 != contentRowCount ) xml = xml + ",";
							 if ( i + 1 == contentRowCount ) xml = xml + '"';
					}

					xml = xml + "/>"
					return xml;
  	  }

	    function generateTopLeftXML( _name , local ){
	    	  var content = document.getElementById( _name + "_content" );
	    	  var realCol = content.rows[0].cells.length;
	    	  var Table = document.getElementById( _name + "_" + local );
	    	  var pix  = "xx";
	    	  if ( local == 'left' ) pix = "yy";
	    	  var Xml = "";
	    	  var StyleXml = "";
	    	  if ( Table != null ){
	    	  	var TableRowLength  = Table.rows.length;
	    	  	if ( TableRowLength > 0 ){
		    	  	Xml = "<" + local + ">";
		    	  	for( var i = 0 ; i < TableRowLength ; i ++ ){
		    	  		  var Row = Table.rows[ i ];
		    	  		  var TableColLength = Row.cells.length;
		    	  		  if ( TableColLength > 0  ){
			    	  		  Xml = Xml + "<row>";
			    	  		  for ( var j = 0 ; j < realCol ; j ++ ){
			    	  		  	  var cellMark = pix + "-" + i + "-" + j;
			    	  		  	  var ___mark = false;
			    	  		  	  for ( var m = 0 ; m < TableColLength ; m ++ ){
					    	  		  	  var Cell = Row.cells[ m ];
					    	  		  	  var CellStyle = Cell.currentStyle;
					    	  		  	  var _id = Cell.getAttribute( "id" );
					    	  		  	  if ( _id == cellMark ){
							    	  		  	  var cellValue = Cell.value;
							    	  		  	  var expand = Cell.expand;
							    	  		  	  if ( expand == null ){
							    	  		  	  		cellValue = Cell.innerText;
							    	  		  	  		cellValue = trim( cellValue );
							    	  		  	  }
							    	  		  	  var rowspan = Cell.getAttribute( "rowspan" );
							    	  		  	  var colspan = Cell.getAttribute( "colspan" );
							    	  		 			Xml = Xml + "<cell rowspan=" + '"' + escape(rowspan) + '"'
							    	  		 			               + " colspan=" + '"' + escape(colspan) + '"'
							    	  		 			               + " text=" + '"' + escape(cellValue) + '"'
							    	  		 			               + " />"
							    	  		 			if ( i == 0 && j == 0 ){
							    	  		 					var bgc = CellStyle.backgroundColor;
							    	  		 					var fontface = CellStyle.fontFamily;
							    	  		 					var fs = CellStyle.fontSize;
							    	  		 					var color = CellStyle.color;
							    	  		 					var align = CellStyle.textAlign;
							    	  		 					StyleXml = "<style fontface=" + '"' + escape(fontface )  + '"'
																		                     + " fontsize=" + '"' + escape(fs ) + '"'
																		                     + " color=" + '"' + escape(color )+ '"'
																		                     + " backcolor=" + '"' + escape(bgc ) + '"'
																		                     + " align=" + '"' + escape(align) + '"'
							    	  		 					                     + "/>"
							    	  		 			}
							    	  		 			___mark = true;
							    	  		 			break;
					    	  		  	  }
			    	  		  		}

			    	  		  		if ( ___mark == false ){
																Xml = Xml + "<cell rowspan=\"0\" colspan=\"0\" text=\"\"/>"
			    	  		  		}
			    	  		  }
			    	  		  Xml = Xml + "</row>";
		    	  		  }
		    	  	}
		    	  	Xml =  Xml + StyleXml + "</" + local + ">";
	    	  	}
	    	  }
	    	  return Xml;
	    }


	    function generateContentXML( _name ){
	    	  var Table = document.getElementById( _name + "_content" );
	    	  var Xml = "";
	    	  var StyleXml = "";
	    	  if ( Table != null ){
	    	  	var TableRowLength  = Table.rows.length;
	    	  	if ( TableRowLength > 0 ){
		    	  	Xml = "<content>";
		    	  	for( var i = 0 ; i < TableRowLength ; i ++ ){
		    	  		  var Row = Table.rows[ i ];
		    	  		  var TableColLength = Row.cells.length;
		    	  		  if ( TableColLength > 0  ){
			    	  		  Xml = Xml + "<row>";
			    	  		  for ( var j = 0 ; j < TableColLength ; j ++ ){
			    	  		  	  var Cell = Row.cells[ j ];
			    	  		  	  var cellValue = Cell.getAttribute( "oldValue" );
			    	  		  	  if ( cellValue != '' ){
			    	  		  	  	  cellValue = trim( cellValue )	;
			    	  		  	  }
			    	  		 			Xml = Xml + "<cell  text=" + '"' + escape(cellValue) + '"' + "/>"
			    	  		 			if ( ( i == 0 || i == 1 ) && j == 0){
			    	  		 				  var CellStyle = Cell.currentStyle;
			    	  		 					var bgc = CellStyle.backgroundColor;
			    	  		 					var fontface = CellStyle.fontFamily;
			    	  		 					var fs = CellStyle.fontSize;
			    	  		 					var color = CellStyle.color;
			    	  		 					var align = CellStyle.textAlign;
			    	  		 					StyleXml = StyleXml  + "<style" + ( i + 1 )
														                     + " fontface=" + '"' + escape(fontface )  + '"'
														                     + " fontsize=" + '"' + escape(fs ) + '"'
														                     + " color=" + '"' + escape(color )+ '"'
														                     + " backcolor=" + '"' + escape(bgc ) + '"'
														                     + " align=" + '"' + escape(align) + '"'
			    	  		 					                     + "/>"
			    	  		 			}
			    	  		  }
			    	  		  Xml = Xml + "</row>";
		    	  		  }
		    	  	}
		    	  	var format = document.getElementById( _name + "_detailform" ).format;
		    	  	if ( format != null ){
		    	  			Xml =  Xml  + "<format value=" + '"' + escape(format.value) + '"' + "/>";
		    	  	}
		    	  	Xml = Xml + StyleXml + "</content>";
	    	  	}
	    	  }
	    	  return Xml;
	    }



	    function generateTitleXml( _name ){
	    	var xml = "";
	    	var olaptitle = document.getElementById( _name + "_title" );
	    	if ( olaptitle != null ){
	    			var text = olaptitle.innerText;
	    			if ( text != '' && trim( text ) !='' ){
							  var CellStyle = olaptitle.currentStyle;
								var bgc = CellStyle.backgroundColor;
								var fontface = CellStyle.fontFamily;
								var fs = CellStyle.fontSize;
								var color = CellStyle.color;
								var align = CellStyle.textAlign;
								xml = xml + "<title "
								         + " text=" + '"' + escape(text) + '"'
		                     + " fontface=" + '"' + escape(fontface )  + '"'
		                     + " fontsize=" + '"' + escape(fs ) + '"'
		                     + " color=" + '"' + escape(color )+ '"'
		                     + " backcolor=" + '"' + escape(bgc ) + '"'
		                     + " align=" + '"' + escape(align) + '"'
		                     + "/>"
	    			}
	    	}
	    	return xml;
	    }

	    //_corner
	    function generateCornerXml( _name ){
	    	var xml = "";
	    	var olap_corner = document.getElementById( _name + "_corner" );
	    	if ( olap_corner != null ){
	    		  var td = olap_corner.rows[ 0 ].cells[ 0 ];
	    			var text = td.innerText;
	    			if ( text != '' && trim( text ) !='' ){
							  var CellStyle = td.currentStyle;
								var bgc = CellStyle.backgroundColor;
								var width = CellStyle.width;
								var height = CellStyle.height;
								var fontface = CellStyle.fontFamily;
								var fs = CellStyle.fontSize;
								var color = CellStyle.color;
								var align = CellStyle.textAlign;
								var colspan = 2;
				  	  	for (var c = 0; ; c++) {
										 var leftCol = document.getElementById(_name + "_leftcol" + c);
									   if (leftCol == null) {
									   	   colspan = c;
										     break;
									   }
								}

								xml = xml + "<corner "
								         + " text=" + '"' + escape(text) + '"'
		                     + " fontface=" + '"' + escape(fontface )  + '"'
		                     + " fontsize=" + '"' + escape(fs ) + '"'
		                     + " color=" + '"' + escape(color )+ '"'
		                     + " backcolor=" + '"' + escape(bgc ) + '"'
		                     + " align=" + '"' + escape(align) + '"'
		                     + " width=" + '"' + escape(width ) + '"'
		                     + " height=" + '"' + escape(height) + '"'
		                     + " colspan=" + '"' + escape(colspan) + '"'
		                     + "/>"
	    			}
	    	}
	    	return xml;
	    }

			function trim(str) {
				str = str.replace(/^\s*(.*)/, "$1");
				str = str.replace(/(.*?)\s*$/, "$1");
				return str;
			}

	    function getDefaultValue( _v1 , _v2 ){
	    	if ( _v1 == null )	{
	    		return _v2;
	    	}
	    	return _v1;
	    }

	    function generateXml( _name ){
	    	var sx = generateSizeXML( _name );
	    	var tx = generateTopLeftXML( _name , "top" );
	    	var lx = generateTopLeftXML( _name , "left" );
	    	var cx = generateContentXML( _name );
	    	var tix = generateTitleXml( _name );
	    	var corx = generateCornerXml( _name );
	    	var xx =  sx + corx + tix + tx + lx + cx ;
	    	var xml = "<?xml version=\"1.0\" encoding=\"GBK\"?><olap>" + xx + "</olap>";
	    	return xml;
	    }



//以下为保存olap状态
var xmlHttp = null;

function createXMLHttpRequest() {
	if( xmlHttp != null ) return;
    if (window.ActiveXObject) {
        xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    else if (window.XMLHttpRequest) {
        xmlHttp = new XMLHttpRequest();
    }
}

function initSaveOlapStatus(  _olapName, _path, _fileName , _actionUrl  ){
 	var olap = document.getElementById( _olapName );
 	olap.path = _path;
 	olap.fileName = _fileName;
 	if( _actionUrl != null ) olap.actionUrl = _actionUrl;
}

function saveOlapStatus( olapName ){
	var olap = document.getElementById( olapName );
	var url = olap.boxUrl + "&title=请输入保存的状态名&oldValue=状态一";
    var _olap_saveName = window.showModalDialog( url, "", "dialogHeight:140px;dialogWidth:320px;status:no;resizable:yes" );
    if( _olap_saveName == null ) return;
    if ( trim( _olap_saveName ) != '' ){
		var form = eval( olapName + "_olap" );
		var params = "<?xml version=\"1.0\" encoding=\"GBK\"?>"
		params += "<olap><operate>save</operate>"  +
		       "<path>" + escape( olap.path ) + "</path>" +
		       "<saveName>" + escape( _olap_saveName ) + "</saveName>" +
		       "<fileName>" + escape( olap.fileName ) + "</fileName>" +
		       "<rowDims>" + escape( form.rowDims ) + "</rowDims>" +
		       "<colDims>" + escape( form.colDims ) + "</colDims>" +
		       "<expandInfo>" + escape( form.expandInfo ) + "</expandInfo>" +
		       "<hideInfo>" + escape( form.hideInfo ) + "</hideInfo>" +
		       "<exp>" + escape( form.exp ) + "</exp>" +
		       "<field>" + escape( form.field ) + "</field></olap>" ;
	    createXMLHttpRequest();
	    xmlHttp.open( "POST", olap.actionUrl, false );
	    //xmlHttp.setRequestHeader( "Content-Type", "application/x-www-form-urlencoded" );
	    xmlHttp.send( params );
		try { 
	   		var strRet = xmlHttp.responseText;
		} catch( exception ) { strRet = "没收到服务器反馈信息！"; }
		if( strRet == "success" ) {
			alert( "保存成功！" );
		}
		else alert( "错误: " + strRet );
    }
    else{
          alert( "状态名不能为空！" )	;
    }
}

function loadOlapStatus( olapName ) {
	var olap = document.getElementById( olapName );
	var url = olap.actionUrl;
	if( url.indexOf( "?" ) > 0 ) url += "&";
	url += "list=true&path=" + olap.path + "&fileName=" + olap.fileName;
    var statusName = window.showModalDialog( url, "", "dialogHeight:285px;dialogWidth:270px;status:no;resizable:yes;scroll:no" );
	if( statusName == null ) return;
	var params = "<?xml version=\"1.0\" encoding=\"GBK\"?>"
	params += "<olap><operate>load</operate><path>"
	         + escape( olap.path ) + "</path><saveName>"
	         + escape( statusName ) + "</saveName><fileName>"
	         + escape( olap.fileName ) + "</fileName></olap>";
    createXMLHttpRequest();
    xmlHttp.open( "POST", olap.actionUrl, false );
    xmlHttp.send( params );
	try {
		var property = xmlHttp.responseXML;
	}catch(e){
		alert( e );
		return;
	}
	var form = eval( olapName + "_olap");
	var rowDims = property.getElementsByTagName("rowDims")[0].firstChild.nodeValue;
	form.rowDims = rowDims;
	var colDims = property.getElementsByTagName("colDims")[0].firstChild.nodeValue;
	form.colDims = colDims;
	var expandInfo = "";
	var expandInfoObj = property.getElementsByTagName("expandInfo")[0].firstChild;
	if ( expandInfoObj != null ){
		expandInfo = expandInfoObj.nodeValue;
	}
  	form.expandInfo = expandInfo;
	var hideInfo = "";
	var hideInfoObj = property.getElementsByTagName("hideInfo")[0].firstChild;
	if ( hideInfoObj != null ){
		hideInfo = hideInfoObj.nodeValue;
	}
    form.hideInfo = hideInfo;
	var exp = "";
	var expObj = property.getElementsByTagName("exp")[0].firstChild;
	if ( expObj != null ){
		exp = expObj.nodeValue
	}
	form.exp = exp;
	var field = "";
	var fieldObj = property.getElementsByTagName("field")[0].firstChild;
	if ( fieldObj != null ){
		field = fieldObj.nodeValue;
	}
    form.field = field;
	rq_requestOlap( olap );
}
