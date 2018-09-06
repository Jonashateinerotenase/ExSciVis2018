#include <iostream>
#include <fstream>
#include <limits>
#include <vector>

int main() {

  std::string file = "Concrete_w1008_h1046_d687_c1_b16.raw";

  std::ifstream in(file, std::ios::binary | std::ios::ate);
  auto length = in.tellg();
  in.seekg(0, std::ios::beg);
  
  std::vector<unsigned char> data; //8 bit
  for (size_t i = 0; i < length / 2; ++i) {
    unsigned short d; //16 bit
    in.read((char*)&d, sizeof(unsigned short));

    float f = (float)d/(float)std::numeric_limits<unsigned short>::max();
    f *= 255.0;

    data.push_back((unsigned char)f);

  }
  in.close();

  std::ofstream out(file.substr(0, file.size()-6) + "8.raw", std::ios::binary);
  out.write((char*)&data[0], data.size()*sizeof(char));
  out.close();


  return 0;
}
