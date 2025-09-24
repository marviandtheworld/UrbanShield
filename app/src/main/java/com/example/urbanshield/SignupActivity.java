package com.example.urbanshield;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.android.volley.Request;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class SignupActivity extends AppCompatActivity {

    private EditText etName, etEmail, etPassword, etPhone;
    private Spinner spinnerUserType;
    private CheckBox cbTerms;
    private Button btnSignUp;

    private static final String SIGNUP_URL = "http://192.168.0.100/urbanshield/api/register.php";
    private static final String TAG = "SIGNUP_DEBUG"; // for Logcat

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_signup);

        etName = findViewById(R.id.etName);
        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        etPhone = findViewById(R.id.etPhone);
        spinnerUserType = findViewById(R.id.spinnerUserType);
        cbTerms = findViewById(R.id.cbTerms);
        btnSignUp = findViewById(R.id.btnSignUp);

        // Spinner values
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                new String[]{"resident", "tourist", "official"}
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerUserType.setAdapter(adapter);

        btnSignUp.setOnClickListener(v -> registerUser());
    }

    private void registerUser() {
        String name = etName.getText().toString().trim();
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();
        String role = spinnerUserType.getSelectedItem().toString();

        if (!cbTerms.isChecked()) {
            Toast.makeText(this, "Accept Terms & Conditions", Toast.LENGTH_SHORT).show();
            return;
        }

        if (name.isEmpty() || email.isEmpty() || password.isEmpty() || phone.isEmpty()) {
            Toast.makeText(this, "Please fill all fields", Toast.LENGTH_SHORT).show();
            return;
        }

        // Debug log for input values
        Log.d(TAG, "Input -> Name: " + name + ", Email: " + email +
                ", Phone: " + phone + ", Role: " + role);

        // Send to backend (using Volley)
        StringRequest request = new StringRequest(Request.Method.POST, SIGNUP_URL,
                response -> {
                    // ✅ Debug log full raw response
                    Log.d(TAG, "Server Response: " + response);

                    try {
                        JSONObject jsonObject = new JSONObject(response);
                        String status = jsonObject.optString("status");
                        String message = jsonObject.optString("message");

                        if ("success".equalsIgnoreCase(status)) {
                            // ✅ Clean toast message
                            Toast.makeText(this, "Sign Up successful", Toast.LENGTH_SHORT).show();

                            // ✅ Debug log after success
                            Log.d(TAG, "Signup successful for role: " + role);

                            // ✅ Redirect user based on role
                            if (role.equals("resident")) {
                                startActivity(new Intent(this, ResidentHomeActivity.class));
                            } else if (role.equals("tourist")) {
                                startActivity(new Intent(this, TouristHomeActivity.class));
                            } else {
                                startActivity(new Intent(this, OfficialHomeActivity.class));
                            }
                            finish();

                        } else {
                            Toast.makeText(this, "Error: " + message, Toast.LENGTH_LONG).show();
                            Log.d(TAG, "Signup failed: " + message);
                        }

                    } catch (JSONException e) {
                        Log.e(TAG, "JSON Parse Error: " + e.getMessage());
                        Toast.makeText(this, "Parse error: " + e.getMessage(), Toast.LENGTH_LONG).show();
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

                    // ✅ Log full error
                    Log.e(TAG, "Volley Error: " + errorMessage, error);

                    Toast.makeText(this, "Error: " + errorMessage, Toast.LENGTH_LONG).show();
                }
        ) {
            @Override
            protected Map<String, String> getParams() {
                Map<String, String> params = new HashMap<>();
                params.put("name", name);
                params.put("email", email);
                params.put("password", password);
                params.put("phone", phone);
                params.put("role", role);

                // ✅ Log the parameters before sending
                Log.d(TAG, "Sending Params: " + params);

                return params;
            }
        };

        Volley.newRequestQueue(this).add(request);
    }
}
