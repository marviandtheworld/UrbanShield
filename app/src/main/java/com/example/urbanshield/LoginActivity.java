package com.example.urbanshield;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class LoginActivity extends AppCompatActivity {

    EditText etEmail, etPassword;
    Button btnLogin;
    TextView tvSignup;

    private static final String TAG = "LOGIN_DEBUG";
    private static final String LOGIN_URL = "http://192.168.0.100/urbanshield/api/login.php";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        btnLogin = findViewById(R.id.btnLogin);
        tvSignup = findViewById(R.id.tvSignup);

        tvSignup.setOnClickListener(v -> {
            startActivity(new Intent(LoginActivity.this, SignupActivity.class));
        });

        btnLogin.setOnClickListener(v -> loginUser());
    }

    private void loginUser() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if(email.isEmpty() || password.isEmpty()){
            Toast.makeText(this, "All fields required", Toast.LENGTH_SHORT).show();
            return;
        }

        // ✅ Debug log input
        Log.d(TAG, "Login attempt -> Email: " + email + ", Password: " + password);

        // API call using Volley
        StringRequest stringRequest = new StringRequest(Request.Method.POST, LOGIN_URL,
                response -> {
                    // ✅ Debug full server response
                    Log.d(TAG, "Server Response: " + response);

                    try {
                        JSONObject obj = new JSONObject(response);
                        String status = obj.optString("status");
                        String message = obj.optString("message");

                        Log.d(TAG, "Parsed Response -> status: " + status + ", message: " + message);

                        if ("success".equalsIgnoreCase(status)) {
                            JSONObject user = obj.optJSONObject("user");
                            if (user == null) {
                                Log.e(TAG, "No 'user' object in response");
                                Toast.makeText(this, "Invalid response from server", Toast.LENGTH_SHORT).show();
                                return;
                            }

                            String userType = user.optString("user_type");
                            Log.d(TAG, "Login successful. User type: " + userType);

                            // ✅ Route user to correct activity
                            if(userType.equals("resident")) {
                                startActivity(new Intent(this, ResidentHomeActivity.class));
                            } else if(userType.equals("tourist")) {
                                startActivity(new Intent(this, TouristHomeActivity.class));
                            } else {
                                startActivity(new Intent(this, OfficialHomeActivity.class));
                            }
                            finish();

                        } else {
                            Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
                            Log.w(TAG, "Login failed -> " + message);
                        }
                    } catch (JSONException e) {
                        Log.e(TAG, "JSON Parse Error: " + e.getMessage(), e);
                        Toast.makeText(this, "Parse error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    }
                },
                error -> {
                    String errorMessage = "Unknown error";
                    if (error.networkResponse != null) {
                        errorMessage = "Code: " + error.networkResponse.statusCode
                                + " | Response: " + new String(error.networkResponse.data);
                    } else if (error.getCause() != null) {
                        errorMessage = "Cause: " + error.getCause().toString();
                    } else if (error.getMessage() != null) {
                        errorMessage = error.getMessage();
                    }

                    Log.e(TAG, "Volley Error: " + errorMessage, error);
                    Toast.makeText(this, "Network Error: " + errorMessage, Toast.LENGTH_LONG).show();
                }){
            @Override
            protected Map<String, String> getParams(){
                Map<String,String> params = new HashMap<>();
                params.put("email", email);
                params.put("password", password);

                // ✅ Debug log request params
                Log.d(TAG, "Sending Params: " + params);

                return params;
            }
        };
        Volley.newRequestQueue(this).add(stringRequest);
    }
}
