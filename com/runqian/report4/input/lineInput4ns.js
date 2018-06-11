var li_currTbl, li_currCell;

//BEGIN
var __UU = "请先选择在哪行前插入！";
var __VV = "此位置不能插入！";
var __WW = "请先选择在哪个区域添加行！";
var __XX = "此区域不能添加行！";
var __YY = "请先选择在哪个区域导入！";
var __ZZ = "此区域不能导入！";
var __AAA = "请先选择要删除的行！";
var __BBB = "此行不能删除！";
var __CCC = "不是数值！";
var LI_AA = "已导入行数：";

_initLineInputVar();
//END
function _insertRow( table ) {
	if( !_submitEditor( table ) ) return;
	if( table.currCell == null ) {
		alert( __UU );
		return;
	}
	var row = table.currCell.parentNode;
	if( !row.getAttribute( "isDetail" ) ) {
		alert( __VV );
		return;
	}
	var index = row.rowIndex;
	while( !row.getAttribute( "isFirst" ) ) {
		index--;
		row = table.rows[ index ];
	}
	_copyRows( table, row, index );
	_calcRowNoInGroup( table, row );
}

function _appendRow( table ) {
	if( !table.isImport ) {
		if( !_submitEditor( table ) ) return -1;
	}
	var index = -1;
	if( table.appendIndex == null || table.appendIndex < 0 ) {
		if( table.currCell == null ) {
			alert( __WW );
			return -1;
		}
		var row = table.currCell.parentNode;
		if( !row.getAttribute( "isDetail" ) ) {
			alert( __XX );
			return -1;
		}
		index = row.rowIndex;
		while( !row.getAttribute( "isFirst" ) ) {
			index--;
			row = table.rows[ index ];
		}
		table.baseRow = row;   //要复制的记录的首行
		var srcCell = row.cells[0].getAttribute( "sc" );
		while( true ) {
			index++;
			var r = null;
			try{ r = table.rows[ index ];}catch(e2){}
			if( r == null ) {
				index = -1;
				break;
			}
			if( !r.getAttribute( "isDetail" ) ) break;
			if( r.getAttribute( "isFirst" ) && r.cells[0].getAttribute( "sc" ) != srcCell ) break;
		}
		if( table.isImport ) table.appendIndex = index;
	}
	else index = table.appendIndex;
	var rowno = _copyRows( table, table.baseRow, index );
	if( table.isImport ) {
		table.appendIndex = rowno + parseInt( table.baseRow.getAttribute( "drows" ) );
	}
	_calcRowNoInGroup( table, table.baseRow );
	return rowno;
}

function _getImportInfo( table ) {
	if( !_submitEditor( table ) ) return null;
	if( !table.getAttribute( "isli" ) ) return null;
	if( table.currCell == null ) {
		table.currCell = _findFirstDetailCell( table );
		if( table.currCell == null ) {
			alert( __YY );
			return null;
		}
	}
	var row = table.currCell.parentNode;
	if( !row.getAttribute( "isDetail" ) ) {
		var c = _findFirstDetailCell( table );
		if( c != null ) row = c.parentNode;
	}
	if( !row.getAttribute( "isDetail" ) ) {
		alert( __ZZ );
		return null;
	}
	var index = row.rowIndex;
	while( !row.getAttribute( "isFirst" ) ) {
		index--;
		row = table.rows[ index ];
	}
	var currRowNo = row.rowIndex;
	var drows = row.getAttribute( "drows" );
	var header = index;
	while( true ) {
		header--;
		if( header < 0 ) break;
		var r = table.rows[ header ];
		if( !r.getAttribute( "isDetail" ) ) break;
	}
	header++;
	var footer = index;
	while( true ) {
		index++;
		var r = null;
		try{ r = table.rows[ index ];}catch(e2){}
		if( r == null ) {
			footer = 0;
			break;
		}
		if( !r.getAttribute( "isDetail" ) ) {
			footer = table.rows.length - index;
			break;
		}
	}
	var info = new Array(3);
	info[0] = header;
	info[1] = footer;
	info[2] = drows;
	info[3] = currRowNo;
	return info;
}

function _iRA( table, datas, importedRows ) {   //_importRowAppend
	var index = _appendRow( table );
	if( index < 0 ) return;
	_setData2Row( table, datas, index );
	if( importedRows % 200 == 0 ) table.rows[ index ].scrollIntoView();
	window.status = LI_AA + ( importedRows + 1 );
}

function _setData2Row( table, datas, index ) { 
	var rows = datas.split( "{}" );
	for( var i = 0; i < rows.length; i++ ) {
		var r = table.rows[ index + i ];
		var cols = rows[i].split( "|" );
		for( var j = 0; j < r.cells.length; j++ ) {
			if( cols[j] == null ) continue;
			var cell = r.cells[j];
			if( cell.getAttribute( "flow" ) ) continue;
			var es = cell.getAttribute( "editStyle" );
			if( ( cell.getAttribute( "writable" ) || es == '6' || es == '8' || es == '11' || es == '12' ) ) { //&& ( cell.style.display != 'none' && cell.parentNode.style.display != 'none' ) ) {
				cell.setAttribute( "value",cols[j] );
				cell.textContent = cols[j];
			}
		}
		if( r.getAttribute( "status" ) == "0" ) r.setAttribute( "status","1" );
		else if( r.getAttribute( "status" ) == "2" ) r.setAttribute( "status", "3" );
	}
	table.changed = true;
}

function _iRR( table, datas, currRowNo, importedRows, drows ) {  //_importRowReplace
	var replaceRowIndex = -1;
	if( table.appendIndex == null || table.appendIndex < 0 ) {
		var currRow = table.rows[ currRowNo ];
		var last = _getDetailLastRow( table, currRow );
		var replaceRowIndex = currRowNo + importedRows * drows;
		if( replaceRowIndex > last ) replaceRowIndex = _appendRow( table );
		else {
			var index = currRowNo;
			var passedRows = 0;
			while( true ) {
				if( index > last ) {
					replaceRowIndex = index;
					break;
				}
				var row = table.rows[ index ];
				if( row.deleted || row.style.display == "none" ) {
					index += drows;
					continue;
				}
				if( passedRows == importedRows ) {
					replaceRowIndex = index;
					break;
				}
				passedRows++;
				index += drows;
			}
			if( replaceRowIndex > last ) replaceRowIndex = _appendRow( table );
		}
		_setData2Row( table, datas, replaceRowIndex );
		window.status = LI_AA + ( importedRows + 1 );
	}
	else {
		_iRA( table, datas, importedRows );
	}
}

function _deleteRow( table ) {
	if( table.currCell == null ) {
		alert( __AAA );
		return;
	}
	var row = table.currCell.parentNode;
	if( !row.getAttribute( "isDetail" ) ) {
		alert( __BBB );
		return;
	}
	var oldCellIndex = table.currCell.getAttribute( "colNo" );
	var index = row.rowIndex;
	var currCellRowIndex = index;
	while( !row.getAttribute( "isFirst" ) ) {
		index--;
		row = table.rows[ index ];
	}
	findRowNoInGroup( table, row );
	var deltaIndex = currCellRowIndex - index;
	var drows = parseInt( row.getAttribute( "drows" ) );
	var srcCell = row.cells[0].getAttribute( "sc" );
	var firstIndex = index, tmpIndex = index;
	var details = 1;
	while( true ) {  //查找本扩展区的第一条记录的首行
		if( tmpIndex == 0 ) break;
		tmpIndex--;
		var r = table.rows[ tmpIndex ];
		if( !r.getAttribute( "isDetail" ) ) break;
		if( r.getAttribute( "isFirst" ) ) {
			if( r.cells[0].getAttribute( "sc" ) == srcCell ) {
				firstIndex = tmpIndex;
				if( !r.deleted ) details++;
			}
			else break;
		}
	}
	var lastIndex = index;
	tmpIndex = index;
	while( true ) {  //查找本扩展区的最后一条记录的首行
		tmpIndex++;
		var r = null;
		try{ r = table.rows[ tmpIndex ];}catch(e2){}
		if( r == null || !r.getAttribute( "isDetail" ) ) break;
		if( r.getAttribute( "isFirst" ) ) {
			if( r.cells[0].getAttribute( "sc" ) == srcCell ) {
				lastIndex = tmpIndex;
				if( !r.deleted ) details++;
			}
			else break;
		}
	}
	if( details == 1 ) {  //最后一条明细了，需要先复制一个空明细
		table.currEditor = null;
		_copyRows( table, row, index );
		index += drows;
	}
	for( var i = 0; i < drows; i++ ) {
		row = table.rows[ index + i ];
		for( var j = 0; j < row.cells.length; j++ ) {
			row.cells[j].style.display = "none";
		}
		row.deleted = true;
		row.style.display = "none";
	}
	if( details > 1 ) {
		var currRow = null;
		var n = index;
		while( true ) {  //往后搜索新的当前行
			index += drows;
			var r = null;
			try{ r = table.rows[ index ];}catch(e2){}
			if( r == null || !r.getAttribute( "isDetail" ) ) break;
			if( r.style.display == "none" ) continue;
			if( r.cells[0].getAttribute( "sc" ) != srcCell ) break;
			currRow = r;
			break;
		}
		if( currRow == null ) { //往前搜索新的当前行
			index = n;
			while( true ) {
				index -= drows;
				var r = null;
				try{ r = table.rows[ index ];}catch(e2){}
				if( r == null || !r.getAttribute( "isDetail" ) ) break;
				if( r.style.display == "none" ) continue;
				if( r.cells[0].getAttribute( "sc" ) != srcCell ) break;
				currRow = r;
				break;
			}
		}
		currRow = table.rows[ currRow.rowIndex + deltaIndex ];
		var currCell = null;
		for( var k = 0; k < currRow.cells.length; k++ ) {
			var c = currRow.cells[k];
			if( c.getAttribute( "colNo" ) == oldCellIndex ) {
				currCell = c;
				break;
			}
		}
		if( currCell != null ) {
			table.currEditor = null;
			_bindingEditor( currCell );
		}
	}
	_calcTbl( table, row.cells[0] );  //删除一行时，重新计算相关组的统计值
	_calcRowNoInGroup( table, row );
}

function findRowNoInGroup( table, row ) {
	if( table.isImport && table.rowNoInGroupLookuped ) return;  //导入excel判断是不是已经查找过组号了
	var drows = parseInt( row.getAttribute( "drows" ) );
	var index = row.rowIndex;
	var hasRowNoInGroup = false;
	for( var j = index; j < index + drows; j++ ) {
		if( hasRowNoInGroup ) break;
		var r1 = table.rows[j];
		for( var k = 0; k < r1.cells.length; k++ ) {
			var cell = r1.cells[k];
			if( cell.getAttribute( "flow" ) && cell.getAttribute( "flow" ).indexOf( "rowNoInGroup" ) >= 0 ) {
				hasRowNoInGroup = true;
				break;
			}
		}
	}
	table.hasRowNoInGroup = hasRowNoInGroup;
	table.rowNoInGroupLookuped = true;
}

function _copyRows( table, baseRow, index ) {
	findRowNoInGroup( table, baseRow );
	var drows = parseInt( baseRow.getAttribute( "drows" ) );
	var baseRows = new Array( drows );
	baseRows[0] = baseRow;
	for( var i = 1; i < drows; i++ ) {
		baseRows[i] = table.rows[ baseRow.rowIndex + i ];
	}
	var firstIndex;
	for( var i = 0; i < drows; i++ ) {
		var rowIndex = index;
		if( index > -1 ) rowIndex = index + i;
		var m = _copyARow( table, baseRows[i], rowIndex );
		if( i == 0 ) firstIndex = m;
		table.setAttribute( "nextRowNo", parseInt( table.getAttribute( "nextRowNo" ) ) + 1 );
	}
	return firstIndex;
}

function _copyARow( table, baseRow, index ) {
	var newrow = table.insertRow( index );
	var newRowStyle = baseRow.cloneNode( true );
	newRowStyle.id = table.id + "_row" + table.getAttribute( "nextRowNo" );
	newRowStyle.setAttribute( "status", "2" );
	newrow.parentNode.replaceChild( newRowStyle, newrow );
	var currCell = null;
	for( var i = 0; i < baseRow.cells.length; i++ ) {
		var newColStyle = newRowStyle.cells[i];
		if( table.currCell == baseRow.cells[i] ) currCell = newColStyle;
		if( newColStyle.oldBkcolor != null ) newColStyle.style.backgroundColor = newColStyle.oldBkcolor;
		if( newColStyle.getAttribute( "flow" ) ) {
			if( newColStyle.getAttribute( "flow" ).indexOf( "rowNoInGroup" ) < 0 ) {
				li_currTbl = table;
				li_currCell = newColStyle;
				var flow = eval( newColStyle.getAttribute( "flow" ) ) + "";
				newColStyle.textContent = flow;
				newColStyle.setAttribute( "value", flow );
			}
		}
		else {
			var es = newColStyle.getAttribute( "editStyle" );
			if( newColStyle.getAttribute( "writable" ) || newColStyle.getAttribute( "calc" ) || es == "6" || es == "8" || es == "11" || es == "12" ) {
				newColStyle.textContent = "";
				newColStyle.setAttribute( "value", "" );
			}
		}
		var id = newColStyle.id;
		var pos = 0;
		for( var k = id.length - 1; k >= 0; k-- ) {
			var s = id.substring( k );
			if( isNaN( s ) ) {
				pos = k + 1;
				break;
			}
		}
		id = id.substring( 0, pos ) + table.getAttribute( "nextRowNo" );
		newColStyle.id = id;
		if( newColStyle.filterCells != null ) {
			var fcs = newColStyle.filterCells.split( "," );
			var s2 = "";
			for( var m = 0; m < fcs.length; m++ ) {
				var fc = fcs[m];
				var spos = 0;
				for( var k = fc.length - 1; k >= 0; k-- ) {
					var s = fc.substring( k );
					if( isNaN( s ) ) {
						spos = k + 1;
						break;
					}
				}
				fc = fc.substring( 0, spos ) + table.getAttribute( "nextRowNo" )
				if( s2.length > 0 ) s2 += ",";
				s2 += fc;
			}
			newColStyle.filterCells = s2;
		}
	}
	if( currCell != null && !table.isImport ) _bindingEditor( currCell );
	return newRowStyle.rowIndex;
}

function _calcCellFlow( table, cell ) {
	if( cell.getAttribute( "flow" ).indexOf( "rowNoInGroup" ) < 0 ) {
		li_currTbl = table;
		li_currCell = cell;
		var flow = eval( cell.getAttribute( "flow" ) ) + "";
		cell.textContent = flow;
		cell.setAttribute( "value", flow );
	}
	else _calcRowNoInGroup( table, cell.parentNode );
}

function _calcRowNoInGroup( table, baseRow ) {
	if( !table.hasRowNoInGroup ) return;
	var first = _getDetailFirstRow( table, baseRow );
	var last = _getDetailLastRow( table, baseRow );
	var rowNo = 0;
	var drows = parseInt( table.rows[first].getAttribute( "drows" ) );
	for( var i = first; i <= last; i += drows ) {
		var r = table.rows[i];
		if( r.deleted ) continue;
		rowNo++;
		for( var j = i; j < i + drows; j++ ) {
			var r1 = table.rows[j];
			for( var k = 0; k < r1.cells.length; k++ ) {
				var cell = r1.cells[k];
				if( cell.getAttribute( "flow" ) && cell.getAttribute( "flow" ).indexOf( "rowNoInGroup" ) >= 0 ) {
					cell.textContent = rowNo + "";
				}
			}
		}
	}
}

function _getDetailFirstRow( table, baseRow ) {
	var index = baseRow.rowIndex;
	while( !baseRow.getAttribute( "isFirst" ) ) {
		index--;
		baseRow = table.rows[ index ];
	}
	var firstIndex = index, tmpIndex = index;
	var srcCell = baseRow.cells[0].getAttribute( "sc" );
	while( true ) {
		if( tmpIndex == 0 ) break;
		tmpIndex--;
		var r = table.rows[ tmpIndex ];
		if( !r.getAttribute( "isDetail" ) ) break;
		if( r.getAttribute( "isFirst" ) ) {
			if( r.cells[0].getAttribute( "sc" ) == srcCell ) {
				firstIndex = tmpIndex;
			}
			else break;
		}
	}
	return firstIndex;
}

function _getDetailLastRow( table, baseRow ) {
	var index = baseRow.rowIndex;
	while( !baseRow.getAttribute( "isFirst" ) ) {
		index--;
		baseRow = table.rows[ index ];
	}
	var lastIndex = index, tmpIndex = index;
	var srcCell = baseRow.cells[0].getAttribute( "sc" );
	while( true ) {
		tmpIndex++;
		var r = null;
		try{ r = table.rows[ tmpIndex ];}catch(e2){}
		if( r == null || !r.getAttribute( "isDetail" ) ) break;
		if( r.getAttribute( "isFirst" ) ) {
			if( r.cells[0].getAttribute( "sc" ) == srcCell ) {
				lastIndex = tmpIndex;
			}
			else break;
		}
	}
	return lastIndex;
}

function _xxf( cellId ) {
	var s = _xxs( cellId );
	if( s.length == 0 ) return 0;
	var value = parseFloat( s );
	if( isNaN( value ) ) return 0;
	return value;
}

function _xxs( cellId ) {
	var currCell = li_currCell;
	var currRow = currCell.parentNode;
	if( currRow.getAttribute( "isDetail" ) ) {
		var firstRow = currRow;
		while( !firstRow.getAttribute( "isFirst" ) ) firstRow = li_currTbl.rows[ firstRow.rowIndex - 1 ];
		var drows = parseInt( firstRow.getAttribute( "drows" ) );
		for( var i = 0; i < drows; i++ ) {
			var row = li_currTbl.rows[ firstRow.rowIndex + i ];
			for( var j = 0; j < row.cells.length; j++ ) {
				var cell = row.cells[j];
				if( cell.getAttribute( "sc" ) == cellId ) return cell.getAttribute( "value" );
			}
		}
	}
	var prow = currRow;
	if( !prow.getAttribute( "ndr" ) ) prow = document.getElementById( currRow.getAttribute( "pid" ) );
	return _xxsGroup( cellId, prow );
}

function _xxsGroup( cellId, grow ) {
	if( grow.tagName != "TABLE" ) {  //在主行中找
		for( var i = 0; i < grow.cells.length; i++ ) {
			var cell = grow.cells[i];
			if( cell.getAttribute( "sc" ) == cellId ) return cell.getAttribute( "value" );
		}
	}
	var ndr = grow.getAttribute( "ndr" ).split( "," );
	var tblId = li_currTbl.id;
	for( var i = 0; i < ndr.length; i++ ) {
		var row = document.getElementById( tblId + "_row" + ndr[i] );
		for( var j = 0; j < row.cells.length; j++ ) {
			var cell = row.cells[j];
			if( cell.getAttribute( "sc" ) == cellId ) return cell.getAttribute( "value" );
		}
	}
	if( grow.tagName == "TABLE" ) return "";   //没找到
	var prow = document.getElementById( grow.getAttribute( "pid" ) );
	return _xxsGroup( cellId, prow );
}

function _calcTbl( table, changedCell ) {
	li_currTbl = table;
	if( changedCell == null ) {  //导入Excel结束时调用
		changedCell = document.getElementById( table.currCell.parentNode.getAttribute( "pid" ) ).cells[0];
	}
	var changedRow = changedCell.parentNode;
	if( changedRow.getAttribute( "isDetail" ) ) {  //细节区的单元格改变了
		var firstRow = changedRow;
		while( !firstRow.getAttribute( "isFirst" ) ) firstRow = li_currTbl.rows[ firstRow.rowIndex - 1 ];
		var drows = parseInt( firstRow.getAttribute( "drows" ) );
		for( var i = 0; i < drows; i++ ) {
			var row = li_currTbl.rows[ firstRow.rowIndex + i ];
			_calcARow( row );
		}
		var prow = document.getElementById( firstRow.getAttribute( "pid" ) );
		_calcGroup( prow );
	}
	else {
		//先把本组的细节区都算一遍
		var mainRow = changedRow;
		if( !mainRow.getAttribute( "ndr" ) ) mainRow = document.getElementById( mainRow.getAttribute( "pid" ) );
		var first = _groupFirstRow( mainRow );
		var last = _groupLastRow( mainRow );
		for( var i = first; i <= last; i++ ) {
			var row = table.rows[i];
			if( row.getAttribute( "isDetail" ) ) _calcARow( row );
		}

		_calcGroup( mainRow );
	}
}

function _calcGroup( grow ) {
	if( grow.tagName != "TABLE" ) _calcARow( grow );
	var ndr = grow.getAttribute( "ndr" ).split( "," );
	var tblId = li_currTbl.id;
	for( var i = 0; i < ndr.length; i++ ) {
		var row = document.getElementById( tblId + "_row" + ndr[i] );
		if( row != null ) _calcARow( row );
	}
	if( grow.tagName == "TABLE" ) return;
	var prow = document.getElementById( grow.getAttribute( "pid" ) );
	_calcGroup( prow );
}

function _calcARow( row ) {
	if( row.deleted ) return;
	for( var i = 0; i < row.cells.length; i++ ) {
		var cell = row.cells[i];
		if( cell.getAttribute( "calc" ) ) {
			li_currCell = cell;
			var s = eval( cell.getAttribute( "calc" ) ) + "";
			cell.setAttribute( "value", s );
			cell.textContent = s;
			_formatCalcValue( cell );
			if( row.getAttribute( "status" ) == "0" ) row.setAttribute( "status", "1" );
			else if( row.getAttribute( "status" ) == "2" ) row.setAttribute( "status","3" );
		}
	}
}

function _cellToFloat( cell ) {
	var f = parseFloat( cell.getAttribute( "value" ) );
	if( isNaN( f ) ) return 0;
	return f;
}

function _isGroupRow( grow, row ) {
	while( true ) {
		if( row == grow ) return true;
		if( row.tagName == "TABLE" ) return false;
		row = document.getElementById( row.getAttribute( "pid" ) );
	}
}

function _groupFirstRow( grow ) {
	if( grow.tagName == "TABLE" ) return 0;
	if( grow.getAttribute( "ndr" ) == null ) return grow.rowIndex;  //不是组行
	var index = grow.rowIndex;
	while( true ) {
		if( index < 0 ) return 0;
		var row = li_currTbl.rows[ index ];
		if( !_isGroupRow( grow, row ) ) return index + 1;
		index--;
	}
}

function _groupLastRow( grow ) {
	if( grow.tagName == "TABLE" ) return li_currTbl.rows.length - 1;
	if( grow.getAttribute( "ndr" ) == null ) return grow.rowIndex;  //不是组行
	var row = grow;
	if( grow.getAttribute( "ndr" ).length > 0 ) {
		var ndr = grow.getAttribute( "ndr" ).split( "," );
		row = document.getElementById( li_currTbl.id + "_row" + ndr[ ndr.length - 1 ] );
	}
	var index = row.rowIndex;
	while( true ) {
		if( index == li_currTbl.rows.length ) return index - 1;
		row = li_currTbl.rows[ index ];
		if( !_isGroupRow( grow, row ) ) return index - 1;
		index++;
	}
}

function sum( cellId ) {
	var currRow = li_currCell.parentNode;
	var prow = currRow;
	if( prow.getAttribute( "ndr" ) == null ) prow = document.getElementById( prow.getAttribute( "pid" ) );
	var value = 0;
	var first = _groupFirstRow( prow );
	var last = _groupLastRow( prow );
	for( var i = first; i <= last; i++ ) {
		var row = li_currTbl.rows[i];
		if( row.deleted ) continue;
		for( var j = 0; j < row.cells.length; j++ ) {
			var cell = row.cells[j];
			if( cell.getAttribute( "sc" ) == cellId ) {
				value += _cellToFloat( cell );
				break;
			}
		}
	}
	return value;
}

function avg( cellId ) {
	var currRow = li_currCell.parentNode;
	var prow = currRow;
	if( !prow.getAttribute( "ndr" ) ) prow = document.getElementById( prow.getAttribute( "pid" ) );
	var value = 0;
	var n = 0;
	var first = _groupFirstRow( prow );
	var last = _groupLastRow( prow );
	for( var i = first; i <= last; i++ ) {
		var row = li_currTbl.rows[i];
		if( row.deleted ) continue;
		for( var j = 0; j < row.cells.length; j++ ) {
			var cell = row.cells[j];
			if( cell.getAttribute( "sc" ) == cellId ) {
				if( cell.getAttribute( "value" ) == null || cell.getAttribute( "value" ).length == 0 ) n++;
				else {
					var v = parseFloat( cell.getAttribute( "value" ) );
					if( !isNaN( v ) ) {
						value += v;
						n++;
					}
					else {
						alert( "\"" + cell.getAttribute( "value" ) + "\"" + __CCC );
						return "NaN";
					}
				}
				break;
			}
		}
	}
	return n == 0 ? 0 : value/n;
}

function count( cellId ) {
	var currRow = li_currCell.parentNode;
	var prow = currRow;
	if( !prow.getAttribute( "ndr" ) ) prow = document.getElementById( prow.getAttribute( "pid" ) );
	var n = 0;
	var first = _groupFirstRow( prow );
	var last = _groupLastRow( prow );
	for( var i = first; i <= last; i++ ) {
		var row = li_currTbl.rows[i];
		if( row.deleted ) continue;
		for( var j = 0; j < row.cells.length; j++ ) {
			var cell = row.cells[j];
			if( cell.getAttribute( "sc" ) == cellId ) {
				n++;
				break;
			}
		}
	}
	return n;
}

function max( cellId ) {
	var currRow = li_currCell.parentNode;
	var prow = currRow;
	if( !prow.getAttribute( "ndr" ) ) prow = document.getElementById( prow.getAttribute( "pid" ) );
	var value = 0;
	var first = _groupFirstRow( prow );
	var last = _groupLastRow( prow );
	for( var i = first; i <= last; i++ ) {
		var row = li_currTbl.rows[i];
		if( row.deleted ) continue;
		for( var j = 0; j < row.cells.length; j++ ) {
			var cell = row.cells[j];
			if( cell.getAttribute( "sc" ) == cellId ) {
				if( cell.getAttribute( "value" ) != null && cell.getAttribute( "value" ).length > 0 ) {
					var v = parseFloat( cell.getAttribute( "value" ) );
					if( !isNaN( v ) ) value = Math.max( value, v );
					else {
						alert( "\"" + cell.getAttribute( "value" ) + "\""+ __CCC );
						return "NaN";
					}
				}
				break;
			}
		}
	}
	return value;
}

function min( cellId ) {
	var currRow = li_currCell.parentNode;
	var prow = currRow;
	if( !prow.getAttribute( "ndr" ) ) prow = document.getElementById( prow.getAttribute( "pid" ) );
	var value = 0;
	var first = _groupFirstRow( prow );
	var last = _groupLastRow( prow );
	for( var i = first; i <= last; i++ ) {
		var row = li_currTbl.rows[i];
		if( row.deleted ) continue;
		for( var j = 0; j < row.cells.length; j++ ) {
			var cell = row.cells[j];
			if( cell.getAttribute( "sc" ) == cellId ) {
				if( cell.getAttribute( "value" ) != null && cell.getAttribute( "value" ).length > 0 ) {
					var v = parseFloat( cell.getAttribute( "value" ) );
					if( !isNaN( v ) ) value = Math.min( value, v );
					else {
						alert( "\"" + cell.getAttribute( "value" ) + "\""+ __CCC );
						return "NaN";
					}
				}
				break;
			}
		}
	}
	return value;
}

function _checkRIValid( table ) {
	li_currTbl = table;
	for( var i = 0; i < table.rows.length; i++ ) {
		var row = table.rows[i];
		if( row.deleted || row.style.display == "none" || ( row.getAttribute( "isDetail" ) && ( row.getAttribute( "status" ) == "2" || row.getAttribute( "status" ) == "0" ) ) ) continue;
		for( var j = 0; j < row.cells.length; j++ ) {
			var cell = row.cells[j];
			li_currCell = cell;
			if( cell.getAttribute( "dataValid" ) && !eval( cell.getAttribute( "dataValid" ) ) ) return false;
			if( cell.getAttribute( "_dv" ) && !eval( cell.getAttribute( "_dv" ) ) ) return false;
		}
	}
	return true;
}

function _submitRowInput( table ) {
	if( !_submitEditor( table ) ) return;
	if( eval( table.id + "_validOnSubmit" ) ) {
		if( ! _checkRIValid( table ) ) return;
	}
	var s = _getRowReportData( table );
	var form = document.getElementById( table.id + "_submitForm" );
	form.data.value = s;
	form.submit();
}

function _getRowReportData( table ) {
	var s = new StringBuffer();
	s.append( "<?xml version=\"1.0\" encoding=\"UTF-8\"?><data>" );
	var s1 = "";
	var topTbl = document.getElementById( table.id + "_$_top" );
	if( topTbl != null ) s1 += _getModifyData( topTbl );
	s1 += _getModifyData( table );
	if( s1.length > 0 ) s.append( "<modify>" ).append( s1 ).append( "</modify>" );
	s1 = "";
	for( var i = table.rows.length - 1; i >= 0; i-- ) {
		var row = table.rows[i];
		if( !row.deleted ) continue;
		if( row.getAttribute( "status" ) == "0" || row.getAttribute( "status" ) == "1" ) {
			if( row.getAttribute( "isFirst" ) ) {
				var id = row.id;
				var rowNo = "";
				for( var k = id.length - 1; k >= 0; k-- ) {
					var stmp = id.substring( k );
					if( isNaN( stmp ) ) {
						rowNo = id.substring( k + 1 );
						break;
					}
				}
				s1 += "<r row=\"" + rowNo + "\"/>";
			}
		}
	}
	if( s1.length > 0 ) s.append( "<del>" ).append( s1 ).append( "</del>" );
	s1 = "";
	for( var i = 0; i < table.rows.length; i++ ) {
		var row = table.rows[i];
		if( row.deleted ) continue;
		if( row.getAttribute( "isFirst" ) ) {
			var drows = parseInt( row.getAttribute( "drows" ) );
			var newModified = false;
			for( var j = 0; j < drows; j++ ) {
				var r = table.rows[ i + j ];
				if( r.getAttribute( "status" ) == "3" ) {
					newModified = true;
					break;
				}
			}
			if( newModified ) {
				var s2 = new StringBuffer();
				s2.append( "<rec did=\"" ).append( row.getAttribute( "did" ) ).append( "\">" );
				for( var j = 0; j < drows; j++ ) {
					var r = table.rows[ i + j ];
					s2.append( _getRowData( r ) );
				}
				s2.append( "</rec>" );
				s1 += s2.toString();
			}
			i += drows - 1;
		}
	}
	if( s1.length > 0 ) s.append( "<ins>" ).append( s1 ).append( "</ins>" );
	s.append( "</data>" );
	return s.toString();
}

function _getModifyData( table ) {
	var s = new StringBuffer();
	for( var i = 0; i < table.rows.length; i++ ) {
		var row = table.rows[i];
		if( row.deleted ) continue;
		if( row.getAttribute( "status" ) == "1" ) s.append( _getRowData( row ) );
	}
	return s.toString();
}

function _getRowData( row ) {
	var s = new StringBuffer();
	s.append( "<r>" );
	for( var i = 0; i < row.cells.length; i++ ) {
		var cell = row.cells[i];
		var pos = cell.id.lastIndexOf( "_" );
		var name = cell.id.substring( pos + 1 );
		s.append( "<c name=\"" ).append( name ).append( "\" value=\"" ).append( XMLEncode( cell.getAttribute( "value" ) ) ).append( "\"/>" );
	}
	s.append( "</r>" );
	return s.toString();
}

function XMLEncode(str){
	var re = /&/g;
	str=str.replace(re,"&amp;");
	re = /</g;
	str=str.replace(re,"&lt;");
	re = />/g;
	str=str.replace(re,"&gt;");
	re = /\'/g;
	str=str.replace(re,"&apos;");
	re = /\"/g;
	str=str.replace(re,"&quot;");
	re = /\r\n/g;
	str=str.replace(re,"\\n");
	re = /\n/g;
	str=str.replace(re,"\\n");
	return str;
}

//以下是流水号函数
function groupMaxNumber() {
	return max( li_currCell.getAttribute( "sc" ) ) + 1;
	/*
	var row = li_currCell.parentNode;
	var index = row.rowIndex;
	while( !row.getAttribute( "isFirst" ) ) {
		index--;
		row = li_currTbl.rows[ index ];
	}
	var drows = parseInt( row.getAttribute( "drows" ) );
	var srcCell = row.cells[0].getAttribute( "sc" );
	var tmpIndex = index;
	var details = 1;
	while( true ) {  //向前查找到本扩展区的首行
		if( tmpIndex == 0 ) break;
		tmpIndex--;
		var r = li_currTbl.rows[ tmpIndex ];
		if( !r.getAttribute( "isDetail" ) ) break;
		if( r.getAttribute( "isFirst" ) ) {
			if( r.cells[0].getAttribute( "sc" ) != srcCell ) break;
			details++;
		}
	}
	tmpIndex = index;
	while( true ) {  //向后查找到本扩展区的末行
		tmpIndex++;
		var r = li_currTbl.rows[ tmpIndex ];
		if( r == null || !r.getAttribute( "isDetail" ) ) break;
		if( r.getAttribute( "isFirst" ) ) {
			if( r.cells[0].getAttribute( "sc" ) != srcCell ) break;
			details++;
		}
	}
	return details;*/
}

function _initSelectACell( table ) {
	if( table.offsetWidth < 1 ) return;
	for( var i = 0; i < table.rows.length; i++ ) {
		var row = table.rows[i];
		if( row.getAttribute( "isDetail" ) ) {
			for( var j = 0; j < row.cells.length; j++ ) {
				var cell = row.cells[j];
				if( cell.getAttribute( "writable" ) ) {
					_bindingEditor( cell );
					try{ table.currEditor.toggleOptions( false ); }catch(e){}
					return;
				}
			}
		}
	}
}

function _findFirstDetailCell( table ) {
	for( var i = 0; i < table.rows.length; i++ ) {
		var row = table.rows[i];
		if( row.getAttribute( "isDetail" ) ) {
			for( var j = 0; j < row.cells.length; j++ ) {
				var cell = row.cells[j];
				if( cell.getAttribute( "writable" ) ) return cell;
			}
		}
	}
	return null;
}
