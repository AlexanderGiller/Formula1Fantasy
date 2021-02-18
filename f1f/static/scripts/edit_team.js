// when the document has fully loaded: 
const selected_units = {drivers: [], team: {id: "", cost: 0.0}};
var roster_id = "";
var is_locked = null;
var total_cost = 0.0;
const max_cost = 100;

$(document).ready(function(){
    
    update_roster_status();
    update_roster_selection();

    $(".edit_team").hide();


    // when a new roster is selected
    $("#roster_selector").change(function() { 
        update_roster_status(); 
        update_roster_selection();
    });
    
    //when the driver button is clicked
    $("#btn-drivers").on("click", function(){
        $(".edit_driver").show();
        $(".edit_team").hide();
        $(this).addClass("btn-primary").removeClass("btn-secondary");
        $("#btn-teams").addClass("btn-secondary").removeClass("btn-primary");
    });
    $("#btn-teams").on("click", function(){
        $(".edit_team").show();
        $(".edit_driver").hide();
        $(this).addClass("btn-primary").removeClass("btn-secondary");
        $("#btn-drivers").addClass("btn-secondary").removeClass("btn-primary");
    });



    // when a card is clicked
    $(".card").on("click", function(){
        if (is_locked)
            return;

        const is_driver = $(this).hasClass('edit_driver');
        const this_id = $(this).attr('id').split('_')[1];
        const this_cost = $(this).find('.price').text();
        var is_new = true;

        // check if the clicked card is already selected
        for (let i = 0; i < selected_units.drivers.length; i++){
            if (Number(selected_units.drivers[i].id) === Number(this_id)) {
                is_new = false; 
                break;
            }
        }

        // if a sixth driver is clicked upon, do nothing
        if (is_driver && selected_units.drivers.length >= 5 && is_new)
            return;
            
        // update units dict and visual
        if (is_driver){
            filterArray(selected_units.drivers, {id: Number(this_id), cost: parseFloat(this_cost)}, "id")
        }
        else if (Number(selected_units.team.id) === Number(this_id)) {
            selected_units.team = {id: "", cost: 0.0}
        } else {
            if (selected_units.team.id !== ""){
                change_card_visual(`#team_${selected_units.team.id}`, "toggle");
            }
            selected_units.team = {id: this_id, cost: this_cost}
        }
        
        console.log(selected_units);

        updateCostBar();

        // toggle css class to visually represent
        change_card_visual(this, "toggle");

    });
    // Save the selections
    $("#save-btn").on("click", function(){
        if (is_locked){
            $("#msg_error").text("This race has already concluded.");                        
            $("#msg_error").show(200).delay(5000).fadeOut();
            return;
        }

        let driver_ids = selected_units.drivers.map(function(e) {
            return e.id;
        });

        // post to url if the total cost is lower than 100
        if (total_cost <= max_cost){
            $.post("/save_roster", 
                {
                    'drivers': JSON.stringify(driver_ids),
                    'team' : JSON.stringify(selected_units.team.id),
                    'roster' : JSON.stringify(roster_id)
                }, 
                function(_, status){
                    if (status === "success"){
                        $("#msg_success").show(200).delay(5000).fadeOut();
                    } else {
                        $("#msg_error").text("Grosjean probably crashed into our servers again...");                        
                        $("#msg_error").show(200).delay(5000).fadeOut();                        
                    }
                });
        } else {
            $("#msg_error").text("The cost is too damn high!");                        
            $("#msg_error").show(200).delay(5000).fadeOut();     
        }
    });
    $("#clear-btn").on("click", function(){
        if (is_locked)
            return;

        change_card_visual(".card", "remove");

        selected_units.drivers = [];
        selected_units.team = {id: "", cost: 0.0};
        updateCostBar();
    });
    
});

//update the total cost bar
function updateCostBar () {
    total_cost = 0.0;

    for (driver of selected_units.drivers){
        total_cost = +(total_cost + parseFloat(driver.cost)).toFixed(1);
    }
    total_cost = +(total_cost + parseFloat(selected_units.team.cost)).toFixed(1);

    $("#progress-bar").attr("aria-valuenow", Math.round(total_cost)).attr("style", `width: ${Math.round(total_cost)}%`).text(total_cost);

    // visual indication
    if (total_cost > max_cost) {
        $("#progress-bar").addClass("bg-danger");
        $("#save-btn").addClass("btn-danger").removeClass("btn-primary");
    } else {
        $("#progress-bar").removeClass("bg-danger");
        $("#save-btn").addClass("btn-primary").removeClass("btn-danger");
    }
}

function update_roster_status () {
    roster_id = $("#roster_selector").val();
    is_locked = $("#roster_selector").find(":selected").hasClass("locked_1");
    $("#locked-text").text(is_locked ? "Locked" : "Unlocked");
}

function update_roster_selection () {
    $.get(`/get_roster?roster_id=${roster_id}`, function(data, status) {
        if(status !== "success") {
            $("#msg_error").text("Grosjean probably crashed into our servers again...");                        
            $("#msg_error").show(200).delay(5000).fadeOut();
            return;
        }
        selected_units.drivers = data.drivers;
        selected_units.team = data.team;

        change_card_visual(".card", "remove");


        for (driver of selected_units.drivers) {
            change_card_visual(`#driver_${driver.id}`, "select");
        }
        change_card_visual(`#team_${selected_units.team.id}`, "select");

        updateCostBar();
    });
}

function change_card_visual (selector, op) {
    if (op === "select") {
        $(selector).addClass('bg-info').find('.checkmark-img').show();
        $(selector).find('.img-thumbnail').removeClass('img-darken');
    } else if (op === "remove") {
        $(selector).removeClass('bg-info').find('.checkmark-img').hide();
        $(selector).find('.img-thumbnail').addClass('img-darken');
    } else if (op === "toggle") {
        $(selector).toggleClass('bg-info').find('.checkmark-img').toggle();
        $(selector).find('.img-thumbnail').toggleClass('img-darken');
    }
}

// add an item to array if it doesnt exist, else delete it
function filterArray(array, object, key) {
    let index = array.findIndex(o => o[key] === object[key]);
    if (index === -1) array.push(object);
    else array.splice(index, 1);
    return array;
}