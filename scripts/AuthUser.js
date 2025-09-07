$(document).ready(function() {
	console.log("Script loaded success");
    const API_BASE_URL = 'https://todo-list.dcism.org';
    
    
    // para sign-in
    $('#signin-form').on('submit', function(e) {
        console.log('Sign in form submitted');
        e.preventDefault();
        
        const email = $('#email').val().trim();
        const password = $('#password').val();
        
        if (!validateSigninForm(email, password)) {
            return;
        }
        
        signinUser(email, password);
    });
    
    
    // for signup
    $('#signup-form').on('submit', function(e) {
        e.preventDefault();
        
        const firstName = $('#firstName').val().trim();
        const lastName = $('#lastName').val().trim();
        const email = $('#email').val().trim();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        
        if (!validateSignupForm(firstName, lastName, email, password, confirmPassword)) {
            return;
        }
        
        const signupData = {
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
            confirm_password: confirmPassword
        };
        
        signupUser(signupData);
    });
    
    // ************************
    // VALIDATE THE CREDENTIALS
    // **************************
    
    function validateSigninForm(email, password) {
        if (!email || !password) {
            showMessage('Email and password are required.', 'error');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return false;
        }
        
        return true;
    }
    
    
    function validateSignupForm(firstName, lastName, email, password, confirmPassword) {
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            showMessage('All fields are required.', 'error');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return false;
        }
        
        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long.', 'error');
            return false;
        }
        
        if (password !== confirmPassword) {
            showMessage('Passwords do not match.', 'error');
            return false;
        }
        
        return true;
    }
    
    
    // ************************
    // SIGNING USER
    // **************************
    
    function signinUser(email, password) {
           console.log('Attempting to sign in user');
           
           const submitBtn = $('#signin-form button[type="submit"]');
           submitBtn.prop('disabled', true).text('Signing In...');
           
           $.ajax({
               url: API_BASE_URL + '/signin_action.php',
               method: 'GET',
               data: {
                   email: email,
                   password: password
               },
               success: function(response) {
                   console.log('Sign in success response:', response);
                 		let parsedRes = JSON.parse(response);
                   
                   if (parsedRes.status === 200) {
                   
                       showMessage(parsedRes.message, 'success');
                       
                       localStorage.setItem('user', JSON.stringify(parsedRes.data));
                       localStorage.setItem('isLoggedIn', 'true');
                       
                       setTimeout(function() {
                           window.location.href = 'pages/todo/index.html';
                       }, 500);
                   } else {
                       showMessage(parsedRes.message, 'error');
                   }
               },
               error: function(xhr, status, error) {
                   console.log('Sign in error:', { xhr, status, error });
                   console.log('Response text:', xhr.responseText);
                   
                   let errorMessage = 'An error occurred while signing in.';
                   
                   try {
                       const responseData = JSON.parse(xhr.responseText);
                       if (responseData.message) {
                           errorMessage = responseData.message;
                       }
                   } catch (e) {
                       console.log('Failed to parse error response as JSON');
                   }
                   
                   showMessage(errorMessage, 'error');
               },
               complete: function() {
                   console.log('Sign in request completed');
                   submitBtn.prop('disabled', false).text('Sign In');
               }
           });
       }
    
    function signupUser(signupData) {
        $('#signupBtn').prop('disabled', true).text('Creating Account...');
        
        console.log("Signup data: ", { ...signupData})
        $.ajax({
            url: API_BASE_URL + '/signup_action.php',
            method: 'POST',
            // contentType: 'application/json',
            data: JSON.stringify(signupData),
            success: function(response) {
							let parsedRes = JSON.parse(response);
                if (parsedRes.status === 200) {
                    showMessage(parsedRes.message, 'success');
                    console.log("Success login");
                    $('#signupForm')[0].reset();
                } else {
                    showMessage(parsedRes.message, 'error');
                    console.log("Error login, " + parsedRes.message);
                }
            },
            error: function(xhr, status, error) {
            		console.log('Sign up error:', { xhr, status, error });
                let errorMessage = 'An error occurred while creating your account.';
                
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                }
                
                showMessage(errorMessage, 'error');
            },
            complete: function() {
                $('#signupBtn').prop('disabled', false).text('Sign Up');
            }
        });
    }
    
    function showMessage(message, type) {
        const messageClass = type === 'success' ? 'message-success' : 'message-error';
        const messageHtml = `<div class="message ${messageClass}">${message}</div>`;
        
        $('.message').remove();
        $('.card').prepend(messageHtml);
        
        setTimeout(function() {
            $('.message').fadeOut(function() {
                $(this).remove();
            });
        }, 5000);
    }
});