function t_ic( obj, subdiv ) {  //tree_iconClick
   	var oldnodevalue = obj.getAttribute( "nv" );
   	if( oldnodevalue == "0" || oldnodevalue == "2" )
      	subdiv.style.display = "";
   	if( oldnodevalue == "0" ) {
      	obj.setAttribute( "nv", "1" );
      	obj.src = obj.src.substring( 0, obj.src.indexOf( "plus.gif" ) ) + "minus.gif";
   	}
   	if( oldnodevalue == "2" ) {
      	obj.setAttribute( "nv", "3" );
      	obj.src = obj.src.substring( 0, obj.src.indexOf( "lastplus.gif" ) ) + "lastminus.gif";
   	}
   	if( oldnodevalue == "1" || oldnodevalue == "3" )
      	subdiv.style.display = "none";
   	if( oldnodevalue == "1" ) {
      	obj.setAttribute( "nv", "0" );
      	obj.src = obj.src.substring( 0, obj.src.indexOf( "minus.gif" ) ) + "plus.gif";
   	}
   	if( oldnodevalue == "3" ) {
      	obj.setAttribute( "nv", "2" );
      	obj.src = obj.src.substring( 0, obj.src.indexOf( "lastminus.gif" ) ) + "lastplus.gif";
   	}
}

function t_mov( obj ) {  //tree_mouseOver
	obj.style.backgroundColor = "darkBlue";
	obj.style.color = "white";
}

function t_mou( obj ) {  //tree_mouseOut
	obj.style.backgroundColor = "";
	obj.style.color = "";
}

function t_s( obj, treeWinId  ) {   //tree_select
	var treeWin = document.getElementById( treeWinId );
    var isMultiSelect = treeWin.isMultiSelect;
	var target = treeWin.target;
	var code = "";
	if( target.tagName == "TD" ) {
        if ( isMultiSelect ){
			var s_a = _s_all( treeWinId );
			if ( s_a.indexOf( ';' ) > 0 ){
			      code = s_a.split( ";" )[0];
			      target.textContent = s_a.split( ";" )[1];
			}
			else target.textContent = "";
        }
        else {
			code = obj.getAttribute( "code" );
			target.textContent = obj.textContent;
        }
		var valueChanged = target.getAttribute( "value" ) != code;
		target.setAttribute( "value", code );
		if( valueChanged ) {
			var tbl = target;
			while( tbl.tagName != "TABLE" ) tbl = tbl.parentNode;
			tbl.changed = true;
			if( !autoCalcOnlyOnSubmit ) {  //自动计算
				var cellName = target.id;
				var pos = cellName.lastIndexOf( "_" );
				var tableId = cellName.substring( 0, pos );
				cellName = cellName.substring( pos + 1 );
				if( !tbl.getAttribute( "isli" ) ) {
					try{ eval( _getReportName( document.getElementById( tableId ) ) + "_autoCalc( '" + cellName + "' )" ); }catch(e1){}
				}
			}
			if( tbl.getAttribute( "isli" ) ) {
				var editingRow = target.parentNode;
				if( editingRow.getAttribute( "status" ) == "0" ) editingRow.setAttribute( "status", "1" );
				else if( editingRow.getAttribute( "status" ) == "2" ) editingRow.setAttribute( "status", "3" );
				_calcTbl( tbl, target );
			}
			var filterCells = target.filterCells;
			if( filterCells != null ) {
				var fcs = filterCells.split( "," );
				for( var i = 0; i < fcs.length; i++ ) {
					var fc = document.getElementById( fcs[i] );
					var ds = eval( fc.getAttribute( "dataSet" ) );
					fc.setAttribute( "editConfig", ds.filter( fc.getAttribute( "filterExp" ) ) );
					fc.setAttribute( "value", "" );
					fc.textContent = "";
				}
			}
		}
	}
	else if( target.tagName == "INPUT" ) {
        if ( isMultiSelect ){
			var s_a = _s_all( treeWinId );
			if ( s_a.indexOf( ';' ) > 0 ){
				code = s_a.split( ";" )[0];
				target.value = s_a.split( ";" )[1];
			}
        }
        else {
			code = obj.getAttribute( "code" );
			target.value = obj.textContent;
        }
		var pos = target.id.lastIndexOf( "_text" );
		var hiddenInput = document.getElementById( target.id.substring( 0, pos ) );
		hiddenInput.value = code;
		var form = hiddenInput;
		while( form.tagName != "FORM" ) form = form.parentNode;
    	try{ eval( form.id + "_autoCalc()" ); }catch(e1){}
    	try{ _rqBoxFilter( target.parentNode.childNodes[0] ); }catch(e2){}
	}
	t_mou( obj );
	treeWin.style.display = "none";
}

function tree_clearSelect( treeWinId ) {
	var treeWin = document.getElementById( treeWinId );
	var target = treeWin.target;
	if( target.tagName == "TD" ) {
		target.textContent = "";
		target.setAttribute( "value", "" );
		var obj = target;
		while( obj.tagName != "TABLE" ) obj = obj.parentNode;
		obj.changed = true;
	}
	else if( target.tagName == "INPUT" ) {
		target.value = "";
		var pos = target.id.lastIndexOf( "_text" );
		var hiddenInput = document.getElementById( target.id.substring( 0, pos ) );
		hiddenInput.value = "";
	}
	treeWin.style.display = "none";
	if( treeWin.isMultiSelect ) _c_c_all( treeWinId );
}

function tree_show( obj, treeWinId ) {
	var treeWin = document.getElementById( treeWinId );
	treeWin.target = obj;
	var isMultiSelect = treeWin.isMultiSelect;
	if ( isMultiSelect && treeWin.target.getAttribute( "value" ) !='' ){
		_c_c_all( treeWinId );//设置checkbox = false
		var isOnlySelectLeaf = treeWin.isOnlySelectLeaf;
		var mm = "";
		if ( treeWin.target.tagName == 'INPUT' ){
		    var pos = treeWin.target.id.lastIndexOf( "_text" );
		    mm = document.getElementById( treeWin.target.id.substring( 0, pos ) ).value;  //真实值
		}
		else{
		    mm = treeWin.target.getAttribute( "value" );
		}
		if ( mm != '' ){
			var mms = mm.split( ',' );
			for ( var j = 0 ; j < mms.length ; j ++ ){
				var m = mms[ j ];
				for( var i = 2; ; i++ ) {
					var node = treeWin.treeFrame.document.getElementById( "id_" + i );
					if ( node == null ) break;
					var ockv = node.getAttribute( "code" );
					if ( m == ockv ){
						node.childNodes[0].checked = true;
					}
				}
			}
		}
	}
	var x = obj.offsetLeft, y = obj.offsetTop;
	var o = obj.offsetParent;
	//var offsetP = treeWin.offsetParent;
	while( o != null && o != treeWin.parentNode ) {
		x += o.offsetLeft;// + o.clientLeft;
		y += o.offsetTop;// + o.clientTop;
		o = o.offsetParent;
	}
	var isScroll = document.getElementById( obj.id.substring( 0, obj.id.lastIndexOf( "_" ) ) + "_contentdiv" ) != null;
	if( isScroll ) {
		var div = obj.parentNode;
		while( div.tagName != "DIV" ) div = div.parentNode;
		x = x - div.scrollLeft;
		y = y - div.scrollTop;
	}
	treeWin.style.left = x;
	treeWin.style.top = y + obj.offsetHeight;
	treeWin.style.display = "";
}

function tree_hide() {
	var trees = document.body.runqianTrees.split( "," );
	for( var i = 0; i < trees.length; i++ ) {
		document.getElementById( trees[i] ).style.display = "none";
	}
}

function checkedChilds( obj , treeWinId ){
   var treeWin = document.getElementById( treeWinId );
   var bChecked = obj.checked;

   var ptd = obj.parentNode;
   var id = ptd.id;
   if ( ptd.getAttribute( "nodetype" ) == '1' ) return;//leaf
   var n = id.substring( id.lastIndexOf( '_' ) + 1 , id.length );

   var _img = treeWin.treeFrame.document.getElementById( "_img_" + n );
   var _div_id = "_div_" + n ;
   var div = treeWin.treeFrame.document.getElementById( _div_id );
   if( div == null ) return;  //说明没有子节点
   if( div.style.display == "none" ) _img.onclick();
   for( var i = 0; i < div.childNodes.length; i++ ) {
         var tbl = div.childNodes[i];
         if( tbl.tagName != "TABLE" ) continue;
         for( var j = 0; j < tbl.rows[0].cells.length; j++ ) {
             var cell = tbl.rows[0].cells[j];
             if( cell.id != null && cell.id.indexOf( "id_" ) == 0 ) {
                  cell.childNodes[0].checked = bChecked;
                  checkedChilds( cell.childNodes[0], treeWinId );
              }
         }
    }
}

function _s_all( treeWinId ){
	 var treeWin = document.getElementById( treeWinId );
     var isOnlySelectLeaf = treeWin.isOnlySelectLeaf;
	 var mm = "";
     var mm_text = "";
	 for( var i = 2; ; i++ ) {
		 var node = treeWin.treeFrame.document.getElementById( "id_" + i );
		 if( node == null ) break;   //说明没有节点了
         var nodetype = node.getAttribute( "nodetype" );
         if ( nodetype == '0' ){
			if ( !isOnlySelectLeaf ){
				if ( node.childNodes[0].checked ){
					mm += node.getAttribute( "code" ) + ",";
					mm_text += node.childNodes[0].getAttribute( "value" ) + ",";
			    }
			}
         }
		 else{
			if ( node.childNodes[0].checked ){
				mm += node.getAttribute( "code" ) + ",";
				mm_text += node.childNodes[0].getAttribute( "value" ) + ",";
			}
         }
	 }
	 if ( mm.indexOf( ',' ) >0 ) mm = mm.substring( 0 , mm.length - 1 );
     if ( mm_text.indexOf( ',' ) >0 ) mm_text = mm_text.substring( 0 , mm_text.length - 1 );
     if ( mm != "" && mm_text !="" ) return mm + ";" + mm_text;
     return "";
}

function _c_c_all( treeWinId ){
     var treeWin = document.getElementById( treeWinId );
	 for( var i = 2; ; i++ ) {
		 var node = treeWin.treeFrame.document.getElementById( "id_" + i );
		 if( node == null ) break;   //说明没有节点了
         node.childNodes[0].checked = false;
	 }
}


